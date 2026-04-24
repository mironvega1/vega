import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from app.core.supabase import supabase

MODEL_PATH = "/tmp/vega_model.pkl"
ENCODERS_PATH = "/tmp/vega_encoders.pkl"


def fetch_training_data() -> pd.DataFrame:
    all_data = []
    batch_size = 1000
    offset = 0
    while True:
        response = supabase.schema("vega").table("listings").select(
            "fiyat, net_m2, brut_m2, oda_sayisi, kat_no, toplam_kat, bina_yasi, cephe, il, ilce, mahalle"
        ).eq("durum", "active").range(offset, offset + batch_size - 1).execute()
        if not response.data:
            break
        all_data.extend(response.data)
        offset += batch_size

    if not all_data:
        return pd.DataFrame()

    df = pd.DataFrame(all_data)
    df = df.dropna(subset=["fiyat", "net_m2"])
    df["fiyat"] = df["fiyat"].astype(float)
    df["net_m2"] = df["net_m2"].astype(float)
    df["kat_no"] = df["kat_no"].fillna(3).astype(float)
    df["toplam_kat"] = df["toplam_kat"].fillna(8).astype(float)
    df["bina_yasi"] = df["bina_yasi"].fillna(10).astype(float)
    df["cephe"] = df["cephe"].fillna("güney")
    df["oda_sayisi"] = df["oda_sayisi"].fillna("3+1")
    df["il"] = df["il"].fillna("istanbul")
    df["ilce"] = df["ilce"].fillna("merkez")
    df["mahalle"] = df["mahalle"].fillna("merkez")
    return df


def train_model():
    df = fetch_training_data()
    if len(df) < 3:
        return None, None

    le_cephe = LabelEncoder()
    le_oda = LabelEncoder()
    le_il = LabelEncoder()
    le_ilce = LabelEncoder()
    le_mahalle = LabelEncoder()

    df["cephe_enc"] = le_cephe.fit_transform(df["cephe"])
    df["oda_enc"] = le_oda.fit_transform(df["oda_sayisi"])
    df["il_enc"] = le_il.fit_transform(df["il"].str.lower().str.strip())
    df["ilce_enc"] = le_ilce.fit_transform(df["ilce"].str.lower().str.strip())
    df["mahalle_enc"] = le_mahalle.fit_transform(df["mahalle"].str.lower().str.strip())

    features = ["net_m2", "kat_no", "toplam_kat", "bina_yasi", "cephe_enc", "oda_enc", "il_enc", "ilce_enc", "mahalle_enc"]
    X = df[features].values
    y = df["fiyat"].values

    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        random_state=42
    )
    model.fit(X, y)

    encoders = {
        "cephe": le_cephe,
        "oda": le_oda,
        "il": le_il,
        "ilce": le_ilce,
        "mahalle": le_mahalle
    }
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoders, ENCODERS_PATH)
    return model, encoders


def get_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODERS_PATH):
        model = joblib.load(MODEL_PATH)
        encoders = joblib.load(ENCODERS_PATH)
        return model, encoders
    return train_model()


def predict_price(
    net_m2: float,
    kat_no: int,
    toplam_kat: int,
    bina_yasi: int,
    cephe: str,
    oda_sayisi: str,
    il: str = "istanbul",
    ilce: str = "merkez",
    mahalle: str = "merkez"
) -> dict:
    model, encoders = get_model()
    if model is None:
        return {"error": "Yeterli veri yok."}

    def safe_encode(encoder, value, default=0):
        try:
            return encoder.transform([value.lower().strip()])[0]
        except ValueError:
            return default

    cephe_enc = safe_encode(encoders["cephe"], cephe)
    oda_enc = safe_encode(encoders["oda"], oda_sayisi)
    il_enc = safe_encode(encoders["il"], il)
    ilce_enc = safe_encode(encoders["ilce"], ilce)
    mahalle_enc = safe_encode(encoders["mahalle"], mahalle)

    X = np.array([[net_m2, kat_no, toplam_kat, bina_yasi, cephe_enc, oda_enc, il_enc, ilce_enc, mahalle_enc]])
    tahmin = model.predict(X)[0]

    feature_names = ["net_m2", "kat_no", "toplam_kat", "bina_yasi", "cephe", "oda_sayisi", "il", "ilce", "mahalle"]
    importances = model.feature_importances_
    shap_values = {
        name: round(float(imp * tahmin), 0)
        for name, imp in zip(feature_names, importances)
    }

    toplam_ilce = len(encoders["ilce"].classes_)
    ilce_biliniyor = ilce.lower().strip() in [c.lower() for c in encoders["ilce"].classes_]
    il_biliniyor = il.lower().strip() in [c.lower() for c in encoders["il"].classes_]
    veri_carpan = min(1.0, toplam_ilce / 50)
    lokasyon_carpan = 0.95 if ilce_biliniyor else (0.80 if il_biliniyor else 0.65)
    guven_skoru = round(min(0.97, max(0.55, 0.55 * lokasyon_carpan + 0.40 * veri_carpan)), 2)

    return {
        "tahmin_fiyat": round(float(tahmin), 0),
        "alt_aralik": round(float(tahmin * 0.88), 0),
        "ust_aralik": round(float(tahmin * 1.12), 0),
        "guven_skoru": guven_skoru,
        "shap_values": shap_values,
        "model_version": "v0.2-gbm",
        "lokasyon": {"il": il, "ilce": ilce, "mahalle": mahalle}
    }


def retrain():
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
    if os.path.exists(ENCODERS_PATH):
        os.remove(ENCODERS_PATH)
    model, encoders = train_model()
    return model is not None


def predict_liquidity(
    il: str = "istanbul",
    ilce: str = "merkez",
    fiyat: float = 5000000,
    net_m2: float = 100,
    oda_sayisi: str = "3+1"
) -> dict:
    """Kaç günde satılır tahmini — basit kural bazlı model."""
    
    ILCE_TALEP = {
        "besiktas": 0.95, "kadikoy": 0.92, "sisli": 0.88, "uskudar": 0.85,
        "bakirkoy": 0.83, "sariyer": 0.80, "atasehir": 0.78, "maltepe": 0.72,
        "kartal": 0.68, "pendik": 0.65, "umraniye": 0.70, "esenyurt": 0.60,
        "bagcilar": 0.58, "basaksehir": 0.65, "beylikduzu": 0.62,
        "cankaya": 0.85, "nilufer": 0.78, "konak": 0.75, "muratpasa": 0.80,
        "konyaalti": 0.82, "bodrum": 0.70, "merkez": 0.60,
    }
    
    talep_skoru = ILCE_TALEP.get(ilce.lower().strip(), 0.60)
    
    m2_fiyat = fiyat / max(net_m2, 1)
    if m2_fiyat > 150000:
        fiyat_carpan = 1.8
    elif m2_fiyat > 80000:
        fiyat_carpan = 1.3
    elif m2_fiyat > 40000:
        fiyat_carpan = 1.0
    else:
        fiyat_carpan = 0.8

    baz_gun = 45
    tahmini_gun = int(baz_gun * fiyat_carpan / talep_skoru)
    tahmini_gun = max(7, min(365, tahmini_gun))

    if tahmini_gun <= 30:
        kategori = "Hizli"
        renk = "green"
    elif tahmini_gun <= 90:
        kategori = "Orta"
        renk = "yellow"
    else:
        kategori = "Yavas"
        renk = "red"

    return {
        "tahmini_satis_suresi_gun": tahmini_gun,
        "kategori": kategori,
        "renk": renk,
        "talep_skoru": round(talep_skoru, 2),
        "m2_fiyat": round(m2_fiyat, 0),
        "lokasyon": {"il": il, "ilce": ilce},
        "aciklama": f"{ilce.title()} bolgesinde bu fiyat araliginda ortalama {tahmini_gun} gunluk satis suresi bekleniyor."
    }
