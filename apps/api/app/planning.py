"""CP8 owned read-only planning and transient photo assistance."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, ConfigDict, Field, StrictInt

from .accounting import report
from .forecasting import evaluate_history
from .photo_assist import suggest
from .routes import Member, require

router = APIRouter(prefix="/api/v1/planning", tags=["planning"])


class ForecastInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    stall: UUID
    target: date
    planned: StrictInt | None = Field(default=None, ge=0, le=100000)


@router.post("/forecast")
async def forecast(body: ForecastInput, member: Member, response: Response):
    require(member, "vendor")
    response.headers["Cache-Control"] = "no-store"
    owned = await member.repository.read(
        "stall_memberships",
        "stall_id",
        stall_id=f"eq.{body.stall}",
        user_id=f"eq.{member.actor.id}",
        membership="eq.owner",
    )
    if not owned:
        raise HTTPException(403, "Owned stall required")
    raw = await member.repository.rpc("cp5_workspace", {})
    rows = report(raw)["sessions"]
    try:
        result = evaluate_history(
            [r for r in rows if r["stall"] == str(body.stall)],
            body.target.isoformat(),
            body.planned,
        )
    except ValueError as error:
        raise HTTPException(422, "Invalid or duplicate session history") from error
    return {
        **result,
        "source": "disposable-connected-history",
        "real_benchmark": "Not established; requires consented pilot history",
    }


@router.post("/photo")
async def photo(request: Request, member: Member, response: Response):
    require(member, "vendor")
    if not member.actor.verified:
        raise HTTPException(403, "Verified hawker required")
    response.headers["Cache-Control"] = "no-store"
    if request.headers.get("Content-Type", "").split(";")[0] not in [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]:
        raise HTTPException(415, "Use JPEG, PNG or WebP")
    consent = request.headers.get("X-Image-Consent") == "yes"
    if not consent:
        raise HTTPException(422, "Explicit image-processing consent required")
    chunks = bytearray()
    async for chunk in request.stream():
        chunks.extend(chunk)
        if len(chunks) > 5242880:
            raise HTTPException(413, "Photo exceeds 5 MB")
    return await suggest(bytes(chunks), consent, str(member.actor.id))
