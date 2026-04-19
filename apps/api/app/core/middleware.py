from fastapi import Request, HTTPException
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
    ]
    if request.url.path in open_paths:
        return await call_next(request)

    api_key = request.headers.get("x-api-key")
    if not api_key:
        raise HTTPException(status_code=401, detail="API key gerekli. x-api-key header'ı ekleyin.")

    key_hash = hash_key(api_key)
    response = supabase.schema("vega").table("api_keys")\
        .select("id, agency_id, is_active, usage_this_month, monthly_limit")\
        .eq("key_hash", key_hash)\
        .eq("is_active", True)\
        .execute()

    if not response.data:
        raise HTTPException(status_code=401, detail="Geçersiz veya deaktif API key.")

    key_data = response.data[0]

    if key_data["usage_this_month"] >= key_data["monthly_limit"]:
        raise HTTPException(status_code=429, detail="Aylık API limiti doldu.")

    supabase.schema("vega").table("api_keys")\
        .update({"usage_this_month": key_data["usage_this_month"] + 1})\
        .eq("id", key_data["id"])\
        .execute()

    request.state.agency_id = key_data["agency_id"]
    return await call_next(request)
