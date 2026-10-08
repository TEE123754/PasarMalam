"""Phase 1 API: health and public non-secret configuration."""

from datetime import datetime, timezone
from os import getenv
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .accounting import router as accounting_router
from .agent import router as agent_router
from .commerce import router as commerce_router
from .community import router as community_router
from .freshness import router as freshness_router
from .impact import router as impact_router
from .onboarding import router as onboarding_router
from .partners import router as partners_router
from .passports import router as passports_router
from .planning import router as planning_router
from .push import router as push_router
from .routes import router
from .settings import get_settings
from .vendor import router as vendor_router
from .voice import router as voice_router
from .voice_workflow import router as voice_workflow_router


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    timestamp: datetime


class PublicConfigResponse(BaseModel):
    api_version: str
    supported_locales: list[str]
    business_integration_mode: Literal["simulated"]
    data_environment: Literal["disposable-demo"] = "disposable-demo"
    capabilities: list[str]
    registration_policy: Literal["invite-only"] = "invite-only"


app = FastAPI(title="PasarMalam API", version="0.1.0")
app.include_router(router)
app.include_router(accounting_router)
app.include_router(impact_router)
app.include_router(passports_router)
app.include_router(onboarding_router)
app.include_router(vendor_router)
app.include_router(freshness_router)
app.include_router(agent_router)
app.include_router(push_router)
app.include_router(voice_router)
app.include_router(community_router)
app.include_router(partners_router)
app.include_router(commerce_router)
app.include_router(planning_router)
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
    allow_headers=["Accept", "Content-Type", "Authorization", "X-Image-Consent"],
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


app.include_router(voice_workflow_router)
