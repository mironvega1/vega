import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.base import BaseHTTPMiddleware
from app.core.middleware import api_key_middleware
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router

app = FastAPI(
    title="VEGA API",
    description="Real Estate Intelligence Infrastructure",
    version="0.1.0"
)

app.add_middleware(BaseHTTPMiddleware, dispatch=api_key_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "VEGA API v0.1.0"}
    