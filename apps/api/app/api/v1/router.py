from fastapi import APIRouter
from app.api.v1.endpoints import health, listings, valuation, auth

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(listings.router, tags=["listings"])
api_router.include_router(valuation.router, tags=["valuation"])
api_router.include_router(auth.router, tags=["auth"])