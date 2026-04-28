from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import os, httpx, json, re
from app.core.supabase import supabase

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


async def ask_groq(system: str, user_msg: str, max_tokens: int = 800) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={"model": GROQ_MODEL, "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user_msg}
            ], "max_tokens": max_tokens}
        )
        data = res.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            return ""


# ─── Request Models ─────────────────────────────────────────────────────────

class EmsalSearchRequest(BaseModel):
    il: str = "istanbul"
    ilce: str = ""
    net_m2_min: Optional[float] = None
    net_m2_max: Optional[float] = None
    fiyat_min: Optional[float] = None
    fiyat_max: Optional[float] = None
    oda_sayisi: Optional[str] = None
    bina_yasi_max: Optional[int] = None
    kat_min: Optional[int] = None
    kat_max: Optional[int] = None
    hedef_fiyat: Optional[float] = None
    hedef_m2: Optional[float] = None
    limit: int = 80


class EmsalIntelligenceRequest(BaseModel):
    il: str
    ilce: str
    mahalle: Optional[str] = None
    net_m2: float
    oda_sayisi: str = "3+1"
    bina_yasi: int = 10
    kat_no: int = 3
    toplam_kat: int = 8
    cephe: str = "güney"
    fiyat: Optional[float] = None


# ─── Scoring helpers ─────────────────────────────────────────────────────────

def _firsat_skoru(m2_fiyat: float, avg_m2: float, oda: str) -> int:
    if avg_m2 == 0:
        return 50
    sapma_pct = (avg_m2 - m2_fiyat) / avg_m2 * 100  # positive = undervalued
    base = min(100, max(0, 50 + sapma_pct * 1.5))
    if oda in ("2+1", "3+1"):
        base = min(100, base + 6)
    return round(base)


def _likidite_skoru(m2_fiyat: float, avg_m2: float, oda: str, bina_yasi: int) -> int:
    base = 38
    if oda in ("2+1", "3+1"):
        base += 22
    elif oda in ("1+1", "4+1"):
        base += 10
    if avg_m2 > 0:
        sapma_abs = abs((m2_fiyat - avg_m2) / avg_m2 * 100)
        if sapma_abs < 5:
            base += 25
        elif sapma_abs < 15:
            base += 12
        elif sapma_abs > 30:
            base -= 15
    if bina_yasi < 5:
        base += 15
    elif bina_yasi < 15:
        base += 7
    elif bina_yasi > 30:
        base -= 12
    return min(100, max(0, base))


def _benzerlik(listing: dict, hedef_m2: Optional[float], hedef_oda: Optional[str]) -> int:
    score = 100
    if hedef_m2:
        try:
            diff = abs(float(listing.get("net_m2") or hedef_m2) - hedef_m2) / hedef_m2
            score -= min(40, round(diff * 80))
        except Exception:
            pass
    if hedef_oda and listing.get("oda_sayisi") != hedef_oda:
        score -= 15
    bina_yasi = listing.get("bina_yasi")
    if bina_yasi and int(bina_yasi) > 30:
        score -= 8
    return max(0, score)


def _sapma_pct(m2_fiyat: float, avg_m2: float) -> float:
    if avg_m2 == 0:
        return 0.0
    return round((m2_fiyat - avg_m2) / avg_m2 * 100, 1)


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/emsal/search")
async def emsal_search(req: EmsalSearchRequest):
    """Emsal arama: filtrelere göre ilanları getir, puanla ve yorumla."""
    try:
        query = supabase.schema("vega").table("listings").select(
            "id,fiyat,net_m2,oda_sayisi,kat_no,toplam_kat,ilce,il,bina_yasi,cephe,lat,lng"
        )
        if req.il:
            query = query.ilike("il", f"%{req.il}%")
        if req.ilce:
            query = query.ilike("ilce", f"%{req.ilce}%")
        if req.net_m2_min is not None:
            query = query.gte("net_m2", req.net_m2_min)
        if req.net_m2_max is not None:
            query = query.lte("net_m2", req.net_m2_max)
        if req.fiyat_min is not None:
            query = query.gte("fiyat", req.fiyat_min)
        if req.fiyat_max is not None:
            query = query.lte("fiyat", req.fiyat_max)
        if req.oda_sayisi:
            query = query.eq("oda_sayisi", req.oda_sayisi)
        if req.bina_yasi_max is not None:
            query = query.lte("bina_yasi", req.bina_yasi_max)
        if req.kat_min is not None:
            query = query.gte("kat_no", req.kat_min)
        if req.kat_max is not None:
            query = query.lte("kat_no", req.kat_max)

        result = query.limit(req.limit).execute()
        listings = result.data or []
    except Exception as e:
        return {"error": str(e), "listings": [], "stats": {}, "ai_yorum": ""}

    # m² prices for statistics
    valid = [
        (float(l.get("fiyat") or 0), float(l.get("net_m2") or 1))
        for l in listings
        if l.get("fiyat") and float(l.get("net_m2") or 0) > 0
    ]
    m2_prices = [f / m for f, m in valid if m > 0]
    avg_m2 = sum(m2_prices) / len(m2_prices) if m2_prices else 0
    fiyatlar = [f for f, _ in valid]

    # Enrich listings with intelligence scores
    enriched = []
    for l in listings:
        try:
            fiyat = float(l.get("fiyat") or 0)
            m2 = float(l.get("net_m2") or 1)
            m2_fiyat = fiyat / m2 if m2 > 0 else 0
            oda = l.get("oda_sayisi") or ""
            bina_y = int(l.get("bina_yasi") or 15)
            sapma = _sapma_pct(m2_fiyat, avg_m2)
            firsat = _firsat_skoru(m2_fiyat, avg_m2, oda)
            likidite = _likidite_skoru(m2_fiyat, avg_m2, oda, bina_y)
            benzerlik = _benzerlik(l, req.hedef_m2, req.oda_sayisi)
            enriched.append({
                **l,
                "m2_fiyati": round(m2_fiyat),
                "sapma_pct": sapma,
                "firsat_skoru": firsat,
                "likidite_skoru": likidite,
                "benzerlik_pct": benzerlik,
                "risk_flag": abs(sapma) > 20,
            })
        except Exception:
            enriched.append({
                **l, "m2_fiyati": 0, "sapma_pct": 0,
                "firsat_skoru": 50, "likidite_skoru": 50,
                "benzerlik_pct": 50, "risk_flag": False,
            })

    enriched.sort(key=lambda x: x.get("firsat_skoru", 0), reverse=True)

    stats = {
        "toplam": len(listings),
        "ort_fiyat": round(sum(fiyatlar) / len(fiyatlar)) if fiyatlar else 0,
        "ort_m2_fiyati": round(avg_m2),
        "min_fiyat": round(min(fiyatlar)) if fiyatlar else 0,
        "max_fiyat": round(max(fiyatlar)) if fiyatlar else 0,
        "firsat_count": sum(1 for l in enriched if l.get("firsat_skoru", 0) > 65),
        "riskli_count": sum(1 for l in enriched if l.get("risk_flag")),
        "likidite_yuksek": sum(1 for l in enriched if l.get("likidite_skoru", 0) > 70),
    }

    # AI commentary
    bolge = req.ilce or req.il
    top_sample = enriched[:8]
    sample_text = "\n".join(
        f"- {l.get('ilce','')} {l.get('net_m2','')}m² {l.get('oda_sayisi','')} "
        f"₺{float(l.get('fiyat') or 0):,.0f} | m²: ₺{l.get('m2_fiyati',0):,} | "
        f"Sapma: {l.get('sapma_pct',0):+.1f}% | Firsat: {l.get('firsat_skoru',0)}"
        for l in top_sample
    ) if top_sample else "Veri yok."

    ai_system = (
        "Sen Vega Istihbarat Platformunun piyasa analisti. "
        "Kisa, kurumsal Turkce analiz yaparsın. Emoji kullanmazsin."
    )
    ai_user = (
        f"{bolge} bolgesinde {len(listings)} emsal ilan analiz edildi.\n"
        f"Ort. m2 fiyati: {avg_m2:,.0f} TL | Firsat: {stats['firsat_count']} ilan | "
        f"Riskli: {stats['riskli_count']} ilan\n\n"
        f"One cikan ilanlar:\n{sample_text}\n\n"
        "Piyasa durumunu, one cikan firsatlari ve riskleri 3-4 cumleyle ozetle."
    )
    ai_yorum = await ask_groq(ai_system, ai_user, 350)

    return {"listings": enriched, "stats": stats, "ai_yorum": ai_yorum}


@router.post("/emsal/intelligence")
async def emsal_intelligence(req: EmsalIntelligenceRequest):
    """Tek mulk icin tam piyasa istihbarati: tahmin, firsat, likidite, AI yorum."""
    bolge = f"{req.il}/{req.ilce}" + (f"/{req.mahalle}" if req.mahalle else "")
    fiyat_str = f"{req.fiyat:,.0f} TL" if req.fiyat else "belirtilmedi"

    ai_system = (
        "Sen Vega Gayrimenkul Istihbarat Motorusun. "
        "Turkiye emlak piyasasinda uzman bir analistsin. "
        "Yaniti SADECE gecerli JSON olarak ver, baska metin ekleme."
    )
    ai_user = f"""
Mulk: {bolge} | {req.net_m2}m2 | {req.oda_sayisi} | {req.bina_yasi} yas | {req.cephe} cephe | Kat {req.kat_no}/{req.toplam_kat}
Istenen fiyat: {fiyat_str}

Analiz et ve JSON don:
{{
  "tahmin_fiyat": <tam sayi TL>,
  "alt_aralik": <tam sayi>,
  "ust_aralik": <tam sayi>,
  "sapma_pct": <ondalikli, istenen fiyat yoksa 0>,
  "firsat_skoru": <0-100>,
  "likidite_skoru": <0-100>,
  "risk_flag": <true/false>,
  "adil_fiyat_min": <tam sayi>,
  "adil_fiyat_max": <tam sayi>,
  "pazarlik_tolerans_pct": <5-15>,
  "onerilen_ilan_fiyati": <tam sayi>,
  "tahmini_satis_gun": <tam sayi>,
  "piyasa_konumu": "<1 cumle>",
  "firsat_analizi": "<1 cumle>",
  "danisman_onerisi": "<1 cumle>",
  "arz_talep_ozeti": "<1 cumle>"
}}
"""
    raw = await ask_groq(ai_system, ai_user, 700)

    # Robust JSON parse
    try:
        m = re.search(r'\{[\s\S]*\}', raw)
        if m:
            data = json.loads(m.group())
            return data
    except Exception:
        pass

    # Algorithmic fallback
    firsat = 55
    likidite = 45
    if req.oda_sayisi in ("2+1", "3+1"):
        likidite += 20
    if req.bina_yasi < 10:
        likidite += 10
    elif req.bina_yasi > 25:
        likidite -= 10
    sapma = 0.0
    if req.fiyat and req.net_m2 > 0:
        # rough estimate based on region
        pass

    return {
        "tahmin_fiyat": 0,
        "alt_aralik": 0,
        "ust_aralik": 0,
        "sapma_pct": sapma,
        "firsat_skoru": min(100, max(0, firsat)),
        "likidite_skoru": min(100, max(0, likidite)),
        "risk_flag": False,
        "adil_fiyat_min": 0,
        "adil_fiyat_max": 0,
        "pazarlik_tolerans_pct": 7,
        "onerilen_ilan_fiyati": 0,
        "tahmini_satis_gun": 60,
        "piyasa_konumu": "Analiz tamamlanamadi, tekrar deneyin.",
        "firsat_analizi": "",
        "danisman_onerisi": "",
        "arz_talep_ozeti": "",
    }
