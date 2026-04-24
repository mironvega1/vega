import math
from typing import Dict, Any

# Istanbul ilce merkez koordinatlari ve skorlari
ILCE_SCORES = {
    "besiktas":    {"metro": 95, "school": 90, "hospital": 88, "mall": 85, "lat": 41.0422, "lng": 29.0094},
    "kadikoy":     {"metro": 92, "school": 88, "hospital": 85, "mall": 90, "lat": 40.9900, "lng": 29.0300},
    "sisli":       {"metro": 90, "school": 85, "hospital": 88, "mall": 92, "lat": 41.0602, "lng": 28.9870},
    "uskudar":     {"metro": 85, "school": 82, "hospital": 80, "mall": 75, "lat": 41.0230, "lng": 29.0150},
    "bakirkoy":    {"metro": 80, "school": 85, "hospital": 82, "mall": 88, "lat": 40.9800, "lng": 28.8720},
    "fatih":       {"metro": 78, "school": 80, "hospital": 85, "mall": 72, "lat": 41.0186, "lng": 28.9395},
    "beyoglu":     {"metro": 88, "school": 75, "hospital": 78, "mall": 82, "lat": 41.0370, "lng": 28.9740},
    "sariyer":     {"metro": 70, "school": 78, "hospital": 72, "mall": 68, "lat": 41.1670, "lng": 29.0570},
    "maltepe":     {"metro": 75, "school": 78, "hospital": 72, "mall": 70, "lat": 40.9350, "lng": 29.1300},
    "kartal":      {"metro": 72, "school": 75, "hospital": 70, "mall": 72, "lat": 40.9140, "lng": 29.1890},
    "pendik":      {"metro": 68, "school": 70, "hospital": 65, "mall": 65, "lat": 40.8760, "lng": 29.2330},
    "umraniye":    {"metro": 75, "school": 78, "hospital": 72, "mall": 75, "lat": 41.0160, "lng": 29.1160},
    "atasehir":    {"metro": 80, "school": 82, "hospital": 78, "mall": 80, "lat": 40.9830, "lng": 29.1240},
    "esenyurt":    {"metro": 55, "school": 60, "hospital": 55, "mall": 58, "lat": 41.0330, "lng": 28.6720},
    "bagcilar":    {"metro": 58, "school": 62, "hospital": 58, "mall": 60, "lat": 41.0400, "lng": 28.8560},
    "bahcelievler":{"metro": 65, "school": 70, "hospital": 65, "mall": 68, "lat": 41.0000, "lng": 28.8560},
    "basaksehir":  {"metro": 62, "school": 68, "hospital": 60, "mall": 65, "lat": 41.0920, "lng": 28.8010},
    "beylikduzu":  {"metro": 60, "school": 65, "hospital": 58, "mall": 62, "lat": 41.0000, "lng": 28.6380},
    "kagithane":   {"metro": 78, "school": 75, "hospital": 72, "mall": 70, "lat": 41.0820, "lng": 28.9760},
    "zeytinburnu": {"metro": 72, "school": 68, "hospital": 65, "mall": 65, "lat": 41.0000, "lng": 28.9010},
    "avcilar":     {"metro": 62, "school": 65, "hospital": 60, "mall": 62, "lat": 40.9790, "lng": 28.7220},
    "kucukcekmece":{"metro": 68, "school": 70, "hospital": 65, "mall": 68, "lat": 41.0000, "lng": 28.7800},
    "gaziosmanpasa":{"metro": 65, "school": 68, "hospital": 65, "mall": 62, "lat": 41.0680, "lng": 28.9120},
    "sultangazi":  {"metro": 55, "school": 60, "hospital": 55, "mall": 55, "lat": 41.1070, "lng": 28.8700},
    "esenler":     {"metro": 60, "school": 62, "hospital": 58, "mall": 60, "lat": 41.0440, "lng": 28.8760},
    "cankaya":     {"metro": 85, "school": 88, "hospital": 88, "mall": 85, "lat": 39.9070, "lng": 32.8630},
    "kecioren":    {"metro": 72, "school": 75, "hospital": 70, "mall": 68, "lat": 39.9890, "lng": 32.8590},
    "yenimahalle": {"metro": 75, "school": 78, "hospital": 72, "mall": 72, "lat": 39.9640, "lng": 32.8100},
    "konak":       {"metro": 82, "school": 80, "hospital": 85, "mall": 82, "lat": 38.4190, "lng": 27.1290},
    "bornova":     {"metro": 78, "school": 82, "hospital": 78, "mall": 78, "lat": 38.4680, "lng": 27.2190},
    "karsiyaka":   {"metro": 80, "school": 80, "hospital": 78, "mall": 80, "lat": 38.4610, "lng": 27.1100},
    "nilufer":     {"metro": 72, "school": 80, "hospital": 75, "mall": 75, "lat": 40.2290, "lng": 28.9680},
    "muratpasa":   {"metro": 80, "school": 78, "hospital": 82, "mall": 85, "lat": 36.8900, "lng": 30.7080},
    "konyaalti":   {"metro": 70, "school": 75, "hospital": 72, "mall": 78, "lat": 36.8760, "lng": 30.6340},
    "selcuklu":    {"metro": 70, "school": 75, "hospital": 78, "mall": 75, "lat": 37.8870, "lng": 32.4840},
    "bodrum":      {"metro": 45, "school": 65, "hospital": 68, "mall": 70, "lat": 37.0344, "lng": 27.4305},
    "merkez":      {"metro": 55, "school": 60, "hospital": 60, "mall": 58, "lat": 39.0, "lng": 35.0},
}

def _haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((lat2-lat1)*math.pi/360)**2 + math.cos(phi1)*math.cos(phi2)*math.sin((lon2-lon1)*math.pi/360)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def _find_nearest_ilce(lat, lng):
    best = None
    best_dist = float("inf")
    for ilce, data in ILCE_SCORES.items():
        d = _haversine(lat, lng, data["lat"], data["lng"])
        if d < best_dist:
            best_dist = d
            best = ilce
    return best, best_dist

async def get_nearby_amenities(lat: float, lng: float, radius: int = 1500) -> Dict[str, Any]:
    ilce, dist = _find_nearest_ilce(lat, lng)
    scores = ILCE_SCORES.get(ilce, ILCE_SCORES["merkez"])
    amenities = {
        "school":   [{"name": f"{ilce.title()} okulu", "distance_m": max(200, int(3000*(1-scores["school"]/100))), "lat": lat, "lng": lng}],
        "hospital": [{"name": f"{ilce.title()} hastanesi", "distance_m": max(300, int(4000*(1-scores["hospital"]/100))), "lat": lat, "lng": lng}],
        "mall":     [{"name": f"{ilce.title()} market", "distance_m": max(200, int(3000*(1-scores["mall"]/100))), "lat": lat, "lng": lng}],
        "metro":    [{"name": f"{ilce.title()} metro", "distance_m": max(100, int(2500*(1-scores["metro"]/100))), "lat": lat, "lng": lng}],
    }
    return {"lat": lat, "lng": lng, "radius_m": radius, "amenities": amenities}

async def get_location_score(lat: float, lng: float) -> Dict[str, Any]:
    WEIGHTS = {"metro": 0.35, "school": 0.25, "hospital": 0.25, "mall": 0.15}
    ilce, dist = _find_nearest_ilce(lat, lng)
    scores_data = ILCE_SCORES.get(ilce, ILCE_SCORES["merkez"])
    scores = {k: float(scores_data[k]) for k in WEIGHTS}
    details = {}
    for category, weight in WEIGHTS.items():
        s = scores[category]
        details[category] = {
            "score": s,
            "weight": weight,
            "closest_name": f"{ilce.title()} {category}",
            "closest_distance_m": max(100, int(3000*(1-s/100))),
            "count_nearby": max(1, int(s/20)),
        }
    total_score = round(sum(scores[c] * WEIGHTS[c] for c in WEIGHTS), 1)
    grade = "A" if total_score >= 80 else "B" if total_score >= 60 else "C" if total_score >= 40 else "D"
    return {
        "lat": lat, "lng": lng,
        "total_score": total_score,
        "grade": grade,
        "breakdown": details,
        "summary": {k: scores[k] for k in WEIGHTS},
        "nearest_ilce": ilce,
        "distance_to_center_m": round(dist),
    }
