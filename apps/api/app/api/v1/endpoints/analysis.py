from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import httpx
import os

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

async def ask_groq(system: str, user: str) -> str:
    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={"model": GROQ_MODEL, "messages": [{"role":"system","content":system},{"role":"user","content":user}], "max_tokens": 2000}
        )
        data = res.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            return data.get("error", {}).get("message", "Yanıt alınamadı.")


# ── Sözleşme Üretici ────────────────────────────────────────────────────────

class SozlesmeRequest(BaseModel):
    turu: str  # "kira" | "satis"
    mulk_adres: str
    mulk_tip: str
    mulk_m2: str
    mulk_fiyat: str
    sozlesme_suresi: Optional[str] = None
    kiraci_veya_alici_ad: str
    ev_sahibi_veya_satici_ad: str
    depozito: Optional[str] = None
    notlar: Optional[str] = None

@router.post("/analysis/sozlesme")
async def sozlesme_uret(req: SozlesmeRequest):
    system = """Sen Türkiye gayrimenkul hukuku uzmanı bir asistansın.
Görevin: Verilen bilgilere göre Türkçe, profesyonel ve hukuken geçerli bir kira veya satış ön sözleşmesi taslağı oluşturmak.
ÖNEMLI: Sadece sözleşme metnini yaz. Madde madde, düzgün biçimlendirilmiş. Ekstra yorum ekleme."""

    user = f"""
Sözleşme türü: {req.turu.upper()} SÖZLEŞMESİ
Mülk adresi: {req.mulk_adres}
Mülk tipi: {req.mulk_tip} / {req.mulk_m2} m²
{"Kira bedeli" if req.turu == "kira" else "Satış bedeli"}: {req.mulk_fiyat} TL
{"Sözleşme süresi: " + req.sozlesme_suresi if req.sozlesme_suresi else ""}
{"Kiracı" if req.turu == "kira" else "Alıcı"} adı: {req.kiraci_veya_alici_ad}
{"Kiraya veren" if req.turu == "kira" else "Satıcı"} adı: {req.ev_sahibi_veya_satici_ad}
{"Depozito: " + req.depozito + " TL" if req.depozito else ""}
{"Ek notlar: " + req.notlar if req.notlar else ""}

Bu bilgilere göre tam ve eksiksiz bir {req.turu} sözleşmesi taslağı oluştur.
"""
    sozlesme = await ask_groq(system, user)
    return {"sozlesme": sozlesme}


# ── Piyasa Analizi ──────────────────────────────────────────────────────────

class PiyasaRequest(BaseModel):
    ilce: str
    il: str = "istanbul"
    mulk_tipi: str = "daire"

@router.post("/analysis/piyasa")
async def piyasa_analizi(req: PiyasaRequest):
    system = """Sen Türkiye gayrimenkul piyasası uzmanısın.
Görevin: Belirtilen ilçe için kapsamlı bir piyasa analizi raporu hazırlamak.
Şunları içer: fiyat trendi, talep durumu, yatırım potansiyeli, riskler, öneriler.
Türkçe, madde madde, profesyonel ton."""

    user = f"{req.il.title()} / {req.ilce.title()} için {req.mulk_tipi} piyasasını analiz et. Güncel piyasa koşullarını değerlendir."
    analiz = await ask_groq(system, user)
    return {"analiz": analiz, "ilce": req.ilce, "il": req.il}


# ── Deal Skoru ──────────────────────────────────────────────────────────────

class DealRequest(BaseModel):
    fiyat: float
    net_m2: float
    ilce: str
    oda_sayisi: str
    bina_yasi: int
    kat_no: int
    toplam_kat: int

@router.post("/analysis/deal-score")
async def deal_score(req: DealRequest):
    m2_fiyat = round(req.fiyat / req.net_m2)

    system = """Sen bir gayrimenkul yatırım analisti olarak çalışıyorsun.
Verilen mülkü 100 üzerinden puanla ve neden o puanı verdiğini açıkla.
Şu faktörleri değerlendir: m² fiyatı, konum, bina yaşı, kat durumu, likidite potansiyeli.
Çıktı: Skor (0-100), Değerlendirme (KAÇIRMA / İYİ FIRSAT / ORTALAMA / PAHALIYA GEÇER), Güçlü yanlar, Zayıf yanlar, Öneri."""

    user = f"""
Mülk bilgileri:
- İlçe: {req.ilce}
- Fiyat: {req.fiyat:,.0f} TL
- Alan: {req.net_m2} m²
- m² fiyatı: {m2_fiyat:,.0f} TL/m²
- Oda: {req.oda_sayisi}
- Bina yaşı: {req.bina_yasi} yıl
- Kat: {req.kat_no}/{req.toplam_kat}

Bu mülkü değerlendir.
"""
    analiz = await ask_groq(system, user)
    return {"skor_analizi": analiz, "m2_fiyat": m2_fiyat}


# ── Bölge Hakimiyet ─────────────────────────────────────────────────────────

class BolgeRequest(BaseModel):
    ilce: str
    il: str = "istanbul"

@router.post("/analysis/bolge-hakimiyet")
async def bolge_hakimiyet(req: BolgeRequest):
    system = """Sen bir gayrimenkul strateji danışmanısın.
Görevin: Bir emlak danışmanı için belirtilen bölgede hakimiyet stratejisi oluşturmak.
İçer: bölge özellikleri, hedef müşteri profili, rakip analizi, hakimiyet taktikleri, 90 günlük aksiyon planı."""

    user = f"{req.il.title()} / {req.ilce.title()} bölgesinde emlak hakimiyeti kurmak için strateji oluştur."
    strateji = await ask_groq(system, user)
    return {"strateji": strateji, "ilce": req.ilce}


# ── Risk Analizi ─────────────────────────────────────────────────────────────

class RiskRequest(BaseModel):
    yatirim_tutari: float
    ilce: str
    mulk_tipi: str
    hedef: str  # "kira_geliri" | "deger_artisi" | "kisa_vadeli_satis"

@router.post("/analysis/risk")
async def risk_analizi(req: RiskRequest):
    system = """Sen bir gayrimenkul risk analisti olarak çalışıyorsun.
Görevin: Yatırım kararı için kapsamlı risk-getiri analizi hazırlamak.
İçer: Piyasa riski, likidite riski, tapu/hukuki riskler, kira geliri projeksiyonu, değer artış tahmini, tavsiye."""

    user = f"""
Yatırım: {req.yatirim_tutari:,.0f} TL
Konum: {req.ilce}
Mülk tipi: {req.mulk_tipi}
Hedef: {req.hedef}

Bu yatırımı tüm riskleriyle değerlendir.
"""
    analiz = await ask_groq(system, user)
    return {"risk_analizi": analiz}
