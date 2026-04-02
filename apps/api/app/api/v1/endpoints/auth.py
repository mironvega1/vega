from fastapi import APIRouter, Header, HTTPException
from app.core.supabase import supabase
import secrets
import hashlib

router = APIRouter()

def hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()

@router.post("/auth/api-key")
async def create_api_key(
    agency_id: str = Header(...),
    name: str = "default"
):
    raw_key = f"vega_{secrets.token_urlsafe(32)}"
    key_hash = hash_key(raw_key)

    supabase.schema("vega").table("api_keys").insert({
        "agency_id": agency_id,
        "key_hash": key_hash,
        "name": name,
        "monthly_limit": 1000,
        "usage_this_month": 0,
        "is_active": True
    }).execute()

    return {
        "api_key": raw_key,
        "message": "API key oluşturuldu. Güvenli bir yerde saklayın, bir daha gösterilmeyecek.",
        "monthly_limit": 1000
    }

@router.get("/auth/usage")
async def get_usage(agency_id: str = Header(...)):
    response = supabase.schema("vega").table("api_keys")\
        .select("name, usage_this_month, monthly_limit, is_active, last_used_at")\
        .eq("agency_id", agency_id)\
        .execute()

    return {"api_keys": response.data}