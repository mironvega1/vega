curl -o ~/vega/apps/api/app/services/location_features.py \
  https://raw.githubusercontent.com/mironvega1/vega/main/apps/api/app/services/location_features.py
cat > ~/vega/apps/api/app/services/location_features.py << 'ENDOFFILE'
import httpx
import math
from typing import Dict, List, Any

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

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

async def _overpass_query(query: str) -> List[Dict]:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(OVERPASS_URL, data={"data": query})
        resp.raise_for_status()
        data = resp.json()
        return data.get("elements", [])

async def get_nearby_amenities(lat: float, lng: float, radius: int = 1500) -> Dict[str, Any]:
    categories = {
        "school": f'node["amenity"="school"](around:{radius},{lat},{lng});way["amenity"="school"](around:{radius},{lat},{lng});',
        "hospital": f'node["amenity"~"hospital|clinic"](around:{radius},{lat},{lng});way["amenity"~"hospital|clinic"](around:{radius},{lat},{lng});',
        "mall": f'node["shop"="mall"](around:{radius},{lat},{lng});way["shop"="mall"](around:{radius},{lat},{lng});node["shop"="supermarket"](around:{radius},{lat},{lng});',
        "metro": f'node["station"="subway"](around:{radius},{lat},{lng});node["railway"="station"](around:{radius},{lat},{lng});node["railway"="subway_entrance"](around:{radius},{lat},{lng});',
    }
    results = {}
    for category, amenity_filter in categories.items():
        query = f"""
[out:json][timeout:10];
(
  {amenity_filter}
);
out center 10;
"""
        try:
            elements = await _overpass_query(query)
            items = []
            for el in elements[:5]:
                el_lat = el.get("lat") or (el.get("center") or {}).get("lat")
                el_lng = el.get("lon") or (el.get("center") or {}).get("lon")
                if not el_lat or not el_lng:
                    continue
                dist = _haversine(lat, lng, el_lat, el_lng)
                items.append({
                    "name": el.get("tags", {}).get("name", "İsimsiz"),
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
ENDOFFILE
cat ~/vega/apps/api/requirements.txt



cat ~/vega/apps/api/requirements.txt

