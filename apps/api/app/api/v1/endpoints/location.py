from fastapi import APIRouter, HTTPException
from app.services.location_features import get_location_score, get_nearby_amenities

router = APIRouter()

@router.get("/location/score")
async def location_score(lat: float, lng: float):
    """Koordinat bazlı lokasyon skoru."""
    try:
        result = await get_location_score(lat, lng)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/location/amenities")
async def location_amenities(lat: float, lng: float, radius: int = 1500):
    """Yakındaki tesisler."""
    try:
        result = await get_nearby_amenities(lat, lng, radius)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
