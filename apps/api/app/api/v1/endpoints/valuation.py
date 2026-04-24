from fastapi import APIRouter
from pydantic import BaseModel
from app.services.valuation_engine import predict_price, retrain

router = APIRouter()

class ValuationRequest(BaseModel):
    net_m2: float
    kat_no: int = 3
    toplam_kat: int = 8
    bina_yasi: int = 10
    cephe: str = "güney"
    oda_sayisi: str = "3+1"
    il: str = "istanbul"
    ilce: str = "merkez"
    mahalle: str = "merkez"

@router.post("/valuation/predict")
async def predict(req: ValuationRequest):
    result = predict_price(
        net_m2=req.net_m2,
        kat_no=req.kat_no,
        toplam_kat=req.toplam_kat,
        bina_yasi=req.bina_yasi,
        cephe=req.cephe,
        oda_sayisi=req.oda_sayisi,
        il=req.il,
        ilce=req.ilce,
        mahalle=req.mahalle
    )
    return result

@router.post("/valuation/retrain")
async def retrain_model():
    success = retrain()
    return {"success": success, "message": "Model yeniden eğitildi" if success else "Yeterli veri yok"}
class LiquidityRequest(BaseModel):
    il: str = "istanbul"
    ilce: str = "merkez"
    fiyat: float = 5000000
    net_m2: float = 100
    oda_sayisi: str = "3+1"

@router.post("/valuation/liquidity")
async def liquidity(req: LiquidityRequest):
    from app.services.valuation_engine import predict_liquidity
    return predict_liquidity(
        il=req.il,
        ilce=req.ilce,
        fiyat=req.fiyat,
        net_m2=req.net_m2,
        oda_sayisi=req.oda_sayisi
    )


class BinaKarsilastirmaRequest(BaseModel):
    il: str = "istanbul"
    ilce: str = "besiktas"
    net_m2: float = 100
    oda_sayisi: str = "3+1"
    bina_yasi: int = 10
    cephe: str = "guney"
    toplam_kat: int = 10

@router.post("/valuation/bina-karsilastirma")
async def bina_karsilastirma(req: BinaKarsilastirmaRequest):
    from app.services.valuation_engine import predict_price
    results = []
    for kat in range(1, req.toplam_kat + 1):
        result = predict_price(
            net_m2=req.net_m2,
            kat_no=kat,
            toplam_kat=req.toplam_kat,
            bina_yasi=req.bina_yasi,
            cephe=req.cephe,
            oda_sayisi=req.oda_sayisi,
            il=req.il,
            ilce=req.ilce,
        )
        results.append({
            "kat": kat,
            "fiyat": result.get("tahmin_fiyat", 0),
            "guven": result.get("guven_skoru", 0),
        })
    return {"karsilastirma": results, "il": req.il, "ilce": req.ilce, "net_m2": req.net_m2}
