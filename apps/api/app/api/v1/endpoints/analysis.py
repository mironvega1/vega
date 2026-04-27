from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import httpx
import os

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

async def ask_groq(system: str, user: str, max_tokens: int = 2500) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={"model": GROQ_MODEL, "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ], "max_tokens": max_tokens}
        )
        data = res.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            return data.get("error", {}).get("message", "Yanıt alınamadı.")


def format_adres(il: str, ilce: str, mahalle: str, sokak: str = "", numara: str = "") -> str:
    parts = [p for p in [mahalle, sokak, numara, ilce, il] if p]
    return ", ".join(parts)


# ── KİRA SÖZLEŞMESİ ────────────────────────────────────────────────────────

class KiraSozlesmeRequest(BaseModel):
    # Mülk bilgileri
    mulk_il: str
    mulk_ilce: str
    mulk_mahalle: str
    mulk_sokak: str
    mulk_kapi_no: str
    mulk_daire_no: Optional[str] = ""
    mulk_tip: str = "Daire"
    mulk_m2: str
    mulk_oda: str = "3+1"
    mulk_kat: str
    mulk_esyali: str = "Hayır"
    # Kira koşulları
    kira_bedeli: str
    odeme_gunu: str = "Her ayın 1'i"
    sozlesme_suresi: str = "1 yıl"
    baslangic_tarihi: str
    depozito_ay: str = "2"
    artis_orani: str = "TÜFE"
    # Kiracı
    kiraci_ad: str
    kiraci_soyad: str
    kiraci_tc: str
    kiraci_telefon: str
    kiraci_adres: str
    # Kiraya veren
    ev_sahibi_ad: str
    ev_sahibi_soyad: str
    ev_sahibi_tc: str
    ev_sahibi_telefon: str
    # Kefil (opsiyonel)
    kefil_ad: Optional[str] = ""
    kefil_soyad: Optional[str] = ""
    kefil_tc: Optional[str] = ""
    # Özel şartlar
    ozel_sartlar: Optional[str] = ""

@router.post("/analysis/sozlesme/kira")
async def kira_sozlesme_uret(req: KiraSozlesmeRequest):
    mulk_adres = f"{req.mulk_mahalle} Mah., {req.mulk_sokak} Sok. No:{req.mulk_kapi_no}{' D:' + req.mulk_daire_no if req.mulk_daire_no else ''}, {req.mulk_ilce}/{req.mulk_il}"
    depozito_tutar = int(req.kira_bedeli.replace(".","").replace(",","")) * int(req.depozito_ay) if req.kira_bedeli.replace(".","").replace(",","").isdigit() else f"{req.depozito_ay} aylık kira"

    system = """Sen deneyimli bir Türk gayrimenkul avukatısın.
Türkiye Borçlar Kanunu'na (TBK 299-378) uygun, eksiksiz ve hukuken bağlayıcı bir konut kira sözleşmesi taslağı yaz.
Sözleşme maddeli olsun, imza bölümleri dahil olsun. Sadece sözleşme metnini yaz, yorum ekleme."""

    user = f"""
KİRA SÖZLEŞMESİ — Aşağıdaki bilgilere göre hazırla:

MADDE 1 — KİRALANAN TAŞINMAZ:
Adres: {mulk_adres}
Tip: {req.mulk_tip} | Alan: {req.mulk_m2} m² | Oda: {req.mulk_oda} | Kat: {req.mulk_kat} | Eşyalı: {req.mulk_esyali}

MADDE 2 — KİRA BEDELİ VE ÖDEME:
Aylık kira: {req.kira_bedeli} TL
Ödeme günü: {req.odeme_gunu}
Artış oranı: {req.artis_orani}

MADDE 3 — SÜRE:
Başlangıç: {req.baslangic_tarihi}
Süre: {req.sozlesme_suresi}

MADDE 4 — DEPOZİTO:
{depozito_tutar} TL ({req.depozito_ay} aylık kira tutarı)

KİRACILAR:
Ad Soyad: {req.kiraci_ad} {req.kiraci_soyad} | TC: {req.kiraci_tc} | Tel: {req.kiraci_telefon}
Adres: {req.kiraci_adres}

KİRAYA VEREN:
Ad Soyad: {req.ev_sahibi_ad} {req.ev_sahibi_soyad} | TC: {req.ev_sahibi_tc} | Tel: {req.ev_sahibi_telefon}

{"KEFİL: " + req.kefil_ad + " " + req.kefil_soyad + " | TC: " + req.kefil_tc if req.kefil_ad else ""}

{"ÖZEL ŞARTLAR: " + req.ozel_sartlar if req.ozel_sartlar else ""}

TBK'ya uygun tam kira sözleşmesi hazırla. Maddeleri numaralandır. Fesih şartları, tahliye koşulları, bakım/onarım yükümlülükleri, yan giderler, tadilat izni gibi standart maddeleri ekle.
"""
    sozlesme = await ask_groq(system, user, max_tokens=3000)
    return {"sozlesme": sozlesme, "mulk_adres": mulk_adres}


# ── SATIŞ ÖN SÖZLEŞMESİ ────────────────────────────────────────────────────

class SatisSozlesmeRequest(BaseModel):
    # Taşınmaz
    mulk_il: str
    mulk_ilce: str
    mulk_mahalle: str
    mulk_sokak: str
    mulk_kapi_no: str
    mulk_daire_no: Optional[str] = ""
    ada_parsel: Optional[str] = ""
    mulk_tip: str = "Daire"
    mulk_m2: str
    mulk_oda: str = "3+1"
    # Satış koşulları
    satis_bedeli: str
    pesınat: str
    kalan_odeme: str
    odeme_tarihi: str
    teslim_tarihi: str
    cezai_sart: str = "Satış bedelinin %10'u"
    ipotek_durumu: str = "İpotek yok"
    # Alıcı
    alici_ad: str
    alici_soyad: str
    alici_tc: str
    alici_telefon: str
    alici_adres: str
    # Satıcı
    satici_ad: str
    satici_soyad: str
    satici_tc: str
    satici_telefon: str
    satici_adres: str
    # Özel şartlar
    ozel_sartlar: Optional[str] = ""

@router.post("/analysis/sozlesme/satis")
async def satis_sozlesme_uret(req: SatisSozlesmeRequest):
    mulk_adres = f"{req.mulk_mahalle} Mah., {req.mulk_sokak} Sok. No:{req.mulk_kapi_no}{' D:' + req.mulk_daire_no if req.mulk_daire_no else ''}, {req.mulk_ilce}/{req.mulk_il}"

    system = """Sen deneyimli bir Türk gayrimenkul avukatısın.
Türk Medeni Kanunu ve Borçlar Kanunu'na uygun, eksiksiz bir gayrimenkul satış ön sözleşmesi (Taahhhütname/Ön Protokol) hazırla.
Cezai şart, ferağ taahhüdü, tapu devir koşulları dahil olsun. Sadece sözleşme metnini yaz."""

    user = f"""
GAYRİMENKUL SATIŞ ÖN SÖZLEŞMESİ — Aşağıdaki bilgilere göre hazırla:

TAŞINMAZ BİLGİLERİ:
Adres: {mulk_adres}
{"Ada/Parsel: " + req.ada_parsel if req.ada_parsel else ""}
Tip: {req.mulk_tip} | Alan: {req.mulk_m2} m² | Oda: {req.mulk_oda}
İpotek: {req.ipotek_durumu}

SATIŞ BEDELİ VE ÖDEME PLANI:
Toplam satış bedeli: {req.satis_bedeli} TL
Peşinat: {req.pesınat} TL (sözleşme imzasında)
Kalan tutar: {req.kalan_odeme} TL — Ödeme tarihi: {req.odeme_tarihi}
Tapu teslim tarihi: {req.teslim_tarihi}
Cezai şart: {req.cezai_sart}

ALICI:
Ad Soyad: {req.alici_ad} {req.alici_soyad} | TC: {req.alici_tc} | Tel: {req.alici_telefon}
Adres: {req.alici_adres}

SATICI:
Ad Soyad: {req.satici_ad} {req.satici_soyad} | TC: {req.satici_tc} | Tel: {req.satici_telefon}
Adres: {req.satici_adres}

{"ÖZEL ŞARTLAR: " + req.ozel_sartlar if req.ozel_sartlar else ""}

Tapu devri taahhüdü, cezai şart mekanizması, iade koşulları, ferağ engeli, kaya/iskan durumu gibi standart maddeleri ekle.
"""
    sozlesme = await ask_groq(system, user, max_tokens=3000)
    return {"sozlesme": sozlesme, "mulk_adres": mulk_adres}


# ── KAPSAMLI ADRES BAZLI ANALİZ ─────────────────────────────────────────────

class AdresAnalizRequest(BaseModel):
    il: str
    ilce: str
    mahalle: str
    sokak: Optional[str] = ""
    numara: Optional[str] = ""
    analiz_turu: str  # "piyasa" | "yatirim" | "kira_getiri" | "rekabet"
    mulk_tipi: str = "daire"

@router.post("/analysis/adres-analiz")
async def adres_analiz(req: AdresAnalizRequest):
    tam_adres = format_adres(req.il, req.ilce, req.mahalle, req.sokak, req.numara)

    analiz_map = {
        "piyasa": "Bu adres ve çevresindeki piyasa analizi: fiyat trendi, satış hızı, m² ortalaması, talep yoğunluğu",
        "yatirim": "Bu adres için yatırım analizi: değer artış potansiyeli, kiracı profili, ROI tahmini, riskler",
        "kira_getiri": "Bu adres için kira getiri analizi: piyasa kira değeri, brüt/net kira getirisi, boşluk riski",
        "rekabet": "Bu adres çevresindeki rekabet analizi: benzer mülkler, fiyat farkları, avantaj/dezavantajlar"
    }

    system = f"""Sen Türkiye gayrimenkul piyasası uzmanısın.
Verilen adres için kapsamlı {req.analiz_turu} analizi yap.
Türkçe, maddeli, profesyonel rapor formatında yaz.
Sokak/mahalle bazında somut değerlendirme yap — genel laflar değil, o lokasyona özel bilgi ver."""

    user = f"""
TAM ADRES: {tam_adres}
MÜLK TİPİ: {req.mulk_tipi}

{analiz_map.get(req.analiz_turu, "Genel analiz yap.")}

Analiz içersin:
1. Konum değerlendirmesi (ulaşım, altyapı, çevre)
2. Fiyat analizi (m² ortalama, alt-üst aralık, trend)
3. Talep profili (kim alıyor/kiralamak istiyor)
4. Güçlü ve zayıf yönler
5. 12 aylık projeksiyon
6. Sonuç ve öneri

Sokak bazında düşün — o mahallede bile farklılıklar var.
"""
    analiz = await ask_groq(system, user, max_tokens=2500)
    return {"analiz": analiz, "tam_adres": tam_adres}


# ── DEAL SKORU (tam adres) ───────────────────────────────────────────────────

class DealRequest(BaseModel):
    fiyat: float
    net_m2: float
    il: str
    ilce: str
    mahalle: str
    sokak: Optional[str] = ""
    numara: Optional[str] = ""
    oda_sayisi: str
    bina_yasi: int
    kat_no: int
    toplam_kat: int
    esyali: str = "Hayır"

@router.post("/analysis/deal-score")
async def deal_score(req: DealRequest):
    m2_fiyat = round(req.fiyat / req.net_m2)
    tam_adres = format_adres(req.il, req.ilce, req.mahalle, req.sokak, req.numara)

    system = """Sen bir gayrimenkul yatırım analisti olarak çalışıyorsun.
Verilen mülkü 100 üzerinden puanla. Çıktı formatı:
SKOR: [0-100]
VERDİKT: [KAÇIRMA / İYİ FIRSAT / ORTALAMA / PAHALİYA GEÇER / KAÇIN]
GÜÇLÜ YANLAR: (madde madde)
ZAYIF YANLAR: (madde madde)
TAVSIYE: (1 paragraf)
FİYAT BEKLENTISI: 12 ay sonra tahmini piyasa değeri"""

    user = f"""
MÜLK: {tam_adres}
Fiyat: {req.fiyat:,.0f} TL | Alan: {req.net_m2} m² | m² fiyatı: {m2_fiyat:,.0f} TL/m²
Oda: {req.oda_sayisi} | Bina yaşı: {req.bina_yasi} yıl | Kat: {req.kat_no}/{req.toplam_kat}
Eşyalı: {req.esyali}
"""
    analiz = await ask_groq(system, user)
    return {"skor_analizi": analiz, "m2_fiyat": m2_fiyat, "tam_adres": tam_adres}


# ── BÖLGE HAKİMİYET ─────────────────────────────────────────────────────────

class BolgeRequest(BaseModel):
    il: str
    ilce: str
    mahalle: Optional[str] = ""

@router.post("/analysis/bolge-hakimiyet")
async def bolge_hakimiyet(req: BolgeRequest):
    hedef = f"{req.mahalle + ' Mah., ' if req.mahalle else ''}{req.ilce}/{req.il}"
    system = """Sen bir gayrimenkul strateji danışmanısın.
Emlak danışmanı için bölge hakimiyet stratejisi oluştur.
Somut, uygulanabilir plan ver. Genel tavsiye değil, o bölgeye özel aksiyon."""

    user = f"""
HEDEF BÖLGE: {hedef}
Görev: Bu bölgede 6 ayda hakimiyet kurma stratejisi.
İçer:
1. Bölge analizi (kim yaşıyor, ne arıyor, hangi segment)
2. Rakip profili (kaçınan acente davranışı)
3. Farklılaşma stratejisi
4. İlk 30 gün aksiyonları (somut liste)
5. 3. ay hedefleri
6. 6. ay kapanış hedefi
7. Dijital varlık önerileri (hangi mahalle, hangi kelimeler)
"""
    strateji = await ask_groq(system, user)
    return {"strateji": strateji, "hedef_bolge": hedef}


# ── RİSK ANALİZİ ────────────────────────────────────────────────────────────

class RiskRequest(BaseModel):
    yatirim_tutari: float
    il: str
    ilce: str
    mahalle: str
    mulk_tipi: str
    hedef: str

@router.post("/analysis/risk")
async def risk_analizi(req: RiskRequest):
    adres = f"{req.mahalle}, {req.ilce}/{req.il}"
    system = """Sen bir gayrimenkul risk analisti olarak çalışıyorsun.
Yatırım için kapsamlı risk-getiri analizi hazırla. Somut sayılar ver."""

    user = f"""
YATIRIM: {req.yatirim_tutari:,.0f} TL
KONUM: {adres}
MÜLK: {req.mulk_tipi}
HEDEF: {req.hedef}

Değerlendir:
1. Piyasa riski (ilçe bazlı fiyat volatilitesi)
2. Likidite riski (bu mülkü satma süresi)
3. Hukuki/tapu riskleri
4. Kira geliri projeksiyonu (yıllık brüt/net)
5. Değer artış senaryoları (iyimser/baz/kötümser)
6. Çıkış stratejisi
7. Genel risk puanı (1-10) ve sonuç
"""
    analiz = await ask_groq(system, user)
    return {"risk_analizi": analiz, "adres": adres}
