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

@router.post("/valuation/predict")
async def predict(req: ValuationRequest):
    result = predict_price(
        net_m2=req.net_m2,
        kat_no=req.kat_no,
        toplam_kat=req.toplam_kat,
        bina_yasi=req.bina_yasi,
        cephe=req.cephe,
        oda_sayisi=req.oda_sayisi
    )
    return result

@router.post("/valuation/retrain")
async def retrain_model():
    success = retrain()
    return {"success": success, "message": "Model yeniden eğitildi" if success else "Yeterli veri yok"}