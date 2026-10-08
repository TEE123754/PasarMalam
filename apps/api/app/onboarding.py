"""Customer-only onboarding after Auth verification; project signup stays closed."""

from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from .repository import Repository
from .routes import Credentials
from .security import verify_token
from .settings import get_settings

router = APIRouter(prefix="/api/v1/me", tags=["identity"])


class CustomerOnboarding(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    display_name: str = Field(min_length=2, max_length=80)
    locale: Literal["en", "ms"]
    accepted: Literal[True]


@router.post("/onboard")
async def onboard(body: CustomerOnboarding, credentials: Credentials):
    if not credentials:
        raise HTTPException(401, "Sign in required")
    settings = get_settings()
    verify_token(credentials.credentials, settings)
    repo = Repository(settings, credentials.credentials)
    result = await repo.rpc(
        "onboard_customer", {"p_display_name": body.display_name, "p_locale": body.locale}
    )
    return {"id": result}
