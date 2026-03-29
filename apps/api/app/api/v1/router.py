from fastapi import APIRouter
from app.api.v1.endpoints import health, listings

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(listings.router, tags=["listings"])
