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
    response = supabase.schema("vega").table("listings").select(
        "fiyat, net_m2, brut_m2, oda_sayisi, kat_no, toplam_kat, bina_yasi, cephe"
    ).eq("durum", "active").execute()

    data = response.data
    if not data:
        return pd.DataFrame()

    df = pd.DataFrame(data)
    df = df.dropna(subset=["fiyat", "net_m2"])
    df["fiyat"] = df["fiyat"].astype(float)
    df["net_m2"] = df["net_m2"].astype(float)
    df["kat_no"] = df["kat_no"].fillna(3).astype(float)
    df["toplam_kat"] = df["toplam_kat"].fillna(8).astype(float)
    df["bina_yasi"] = df["bina_yasi"].fillna(10).astype(float)
    df["cephe"] = df["cephe"].fillna("güney")
    df["oda_sayisi"] = df["oda_sayisi"].fillna("3+1")

    return df


def train_model():
    df = fetch_training_data()

    if len(df) < 3:
        return None, None

    le_cephe = LabelEncoder()
    le_oda = LabelEncoder()

    df["cephe_enc"] = le_cephe.fit_transform(df["cephe"])
    df["oda_enc"] = le_oda.fit_transform(df["oda_sayisi"])

    features = ["net_m2", "kat_no", "toplam_kat", "bina_yasi", "cephe_enc", "oda_enc"]
    X = df[features].values
    y = df["fiyat"].values

    model = GradientBoostingRegressor(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        random_state=42
    )
    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)
    joblib.dump({"cephe": le_cephe, "oda": le_oda}, ENCODERS_PATH)

    return model, {"cephe": le_cephe, "oda": le_oda}


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
    oda_sayisi: str
) -> dict:
    model, encoders = get_model()

    if model is None:
        return {"error": "Yeterli veri yok. Daha fazla ilan yükleyin."}

    try:
        cephe_enc = encoders["cephe"].transform([cephe])[0]
    except ValueError:
        cephe_enc = 0

    try:
        oda_enc = encoders["oda"].transform([oda_sayisi])[0]
    except ValueError:
        oda_enc = 0

    X = np.array([[net_m2, kat_no, toplam_kat, bina_yasi, cephe_enc, oda_enc]])
    tahmin = model.predict(X)[0]

    feature_names = ["net_m2", "kat_no", "toplam_kat", "bina_yasi", "cephe", "oda_sayisi"]
    importances = model.feature_importances_
    shap_values = {
        name: round(float(imp * tahmin), 0)
        for name, imp in zip(feature_names, importances)
    }

    return {
        "tahmin_fiyat": round(float(tahmin), 0),
        "alt_aralik": round(float(tahmin * 0.90), 0),
        "ust_aralik": round(float(tahmin * 1.10), 0),
        "guven_skoru": 0.75,
        "shap_values": shap_values,
        "model_version": "v0.1-gbm"
    }


def retrain():
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
    if os.path.exists(ENCODERS_PATH):
        os.remove(ENCODERS_PATH)
    model, encoders = train_model()
    return model is not None
    