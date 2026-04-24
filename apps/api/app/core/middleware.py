from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.supabase import supabase
import hashlib

def hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()

async def api_key_middleware(request: Request, call_next):
    open_paths = [
        "/", "/docs", "/openapi.json", "/redoc",
        "/api/v1/health",
        "/api/v1/auth/api-key",
        "/api/v1/valuation/retrain",
        "/api/v1/listings",
        "/api/v1/valuation/predict",
        "/api/v1/valuation/liquidity",
        "/api/v1/location/score",
        "/api/v1/location/amenities",
    ]
    if request.url.path in open_paths:
        return await call_next(request)

    api_key = request.headers.get("x-api-key")
    if not api_key:
        return JSONResponse(status_code=401, content={"detail": "API key gerekli. x-api-key header ekleyin."})

    key_hash = hash_key(api_key)
    try:
        response = supabase.schema("vega").table("api_keys").select("id, agency_id, is_active, usage_this_month, monthly_limit").eq("key_hash", key_hash).eq("is_active", True).execute()
    except Exception:
        return JSONResponse(status_code=500, content={"detail": "Auth servisi hatasi."})

    if not response.data:
        return JSONResponse(status_code=401, content={"detail": "Gecersiz API key."})

    key_data = response.data[0]
    if key_data["usage_this_month"] >= key_data["monthly_limit"]:
        return JSONResponse(status_code=429, content={"detail": "Aylik limit doldu."})

    supabase.schema("vega").table("api_keys").update({"usage_this_month": key_data["usage_this_month"] + 1}).eq("id", key_data["id"]).execute()
    request.state.agency_id = key_data["agency_id"]
    return await call_next(request)
