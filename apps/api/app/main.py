"""Phase 1 API: health and public non-secret configuration."""

from datetime import datetime, timezone
from os import getenv
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .routes import router
from .settings import get_settings


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    timestamp: datetime


class PublicConfigResponse(BaseModel):
    api_version: str
    supported_locales: list[str]
    business_integration_mode: Literal["simulated"]
    capabilities: list[str]


app = FastAPI(title="PasarMalam API", version="0.1.0")
app.include_router(router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in getenv(
            "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Accept", "Content-Type", "Authorization"],
)


@app.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    return HealthResponse(
        status="ok", service="pasarmalam-api", timestamp=datetime.now(timezone.utc)
    )


@app.get("/api/v1/config", response_model=PublicConfigResponse, tags=["system"])
def public_config() -> PublicConfigResponse:
    return PublicConfigResponse(
        api_version="v1",
        supported_locales=["en", "ms"],
        business_integration_mode="simulated",
        capabilities=["fixture-discovery", "public-health"]
        + (["connected-discovery", "authenticated-rpc"] if get_settings().configured else []),
    )
