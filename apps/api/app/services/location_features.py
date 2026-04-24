import httpx
import math
from typing import Dict, List, Any

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def _distance_score(distance_m: float, ideal_m: float = 500, worst_m: float = 3000) -> float:
    if distance_m <= ideal_m:
        return 100.0
    if distance_m >= worst_m:
        return 0.0
    return round(100 * (1 - (distance_m - ideal_m) / (worst_m - ideal_m)), 1)

async def _nominatim_search(query: str, lat: float, lng: float, radius: int = 2000) -> List[Dict]:
    async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": "vega-realestate/1.0"}) as client:
        params = {
            "q": query,
            "format": "json",
            "limit": 5,
            "countrycodes": "tr",
            "viewbox": f"{lng-0.05},{lat+0.05},{lng+0.05},{lat-0.05}",
            "bounded": 1,
        }
        resp = await client.get(NOMINATIM_URL, params=params)
        resp.raise_for_status()
        return resp.json()

async def get_nearby_amenities(lat: float, lng: float, radius: int = 1500) -> Dict[str, Any]:
    categories = {
        "school": "okul",
        "hospital": "hastane",
        "mall": "avm market",
        "metro": "metro istasyon",
    }
    results = {}
    for category, query in categories.items():
        try:
            elements = await _nominatim_search(query, lat, lng, radius)
            items = []
            for el in elements[:5]:
                el_lat = float(el.get("lat", 0))
                el_lng = float(el.get("lon", 0))
                if not el_lat or not el_lng:
                    continue
                dist = _haversine(lat, lng, el_lat, el_lng)
                if dist <= radius:
                    items.append({
                        "name": el.get("display_name", "").split(",")[0],
                        "distance_m": round(dist),
                        "lat": el_lat,
                        "lng": el_lng,
                    })
            items.sort(key=lambda x: x["distance_m"])
            results[category] = items
        except Exception:
            results[category] = []
    return {"lat": lat, "lng": lng, "radius_m": radius, "amenities": results}

async def get_location_score(lat: float, lng: float) -> Dict[str, Any]:
    WEIGHTS = {"metro": 0.35, "school": 0.25, "hospital": 0.25, "mall": 0.15}
    IDEAL   = {"metro": 400,  "school": 600,  "hospital": 800,  "mall": 1000}
    WORST   = {"metro": 2000, "school": 2500, "hospital": 3000, "mall": 3000}
    amenity_data = await get_nearby_amenities(lat, lng, 3000)
    amenities = amenity_data["amenities"]
    scores = {}
    details = {}
    for category, weight in WEIGHTS.items():
        items = amenities.get(category, [])
        if items:
            closest_dist = items[0]["distance_m"]
            closest_name = items[0]["name"]
            raw_score = _distance_score(closest_dist, IDEAL[category], WORST[category])
        else:
            closest_dist = None
            closest_name = None
            raw_score = 0.0
        scores[category] = raw_score
        details[category] = {
            "score": raw_score,
            "weight": weight,
            "closest_name": closest_name,
            "closest_distance_m": closest_dist,
            "count_nearby": len(items),
        }
    total_score = round(sum(scores[c] * WEIGHTS[c] for c in WEIGHTS), 1)
    grade = "A" if total_score >= 80 else "B" if total_score >= 60 else "C" if total_score >= 40 else "D"
    return {
        "lat": lat, "lng": lng,
        "total_score": total_score,
        "grade": grade,
        "breakdown": details,
        "summary": {
            "metro_score": scores["metro"],
            "school_score": scores["school"],
            "hospital_score": scores["hospital"],
            "mall_score": scores["mall"],
        }
    }
