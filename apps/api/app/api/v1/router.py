from fastapi import APIRouter
from app.api.v1.endpoints import health, listings, valuation, auth, location, ai

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(listings.router, tags=["listings"])
api_router.include_router(valuation.router, tags=["valuation"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(location.router, tags=["location"])
api_router.include_router(ai.router, tags=["ai"])
