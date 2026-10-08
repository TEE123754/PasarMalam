"""Public minimal passports; private append-only manual records and stateless local QR."""

from io import BytesIO
from os import getenv
from typing import Literal
from uuid import UUID

import qrcode
import qrcode.image.svg
from fastapi import APIRouter, HTTPException, Query, Response
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, model_validator

from .routes import Member, PublicRepository, require

router = APIRouter(prefix="/api/v1/passports", tags=["passports"])


class HandlingData(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    kind: Literal["storage", "temperature"]
    effective_at: AwareDatetime
    storage: Literal["ambient", "chilled", "hot-held", "unknown"] | None = None
    value: float | None = Field(default=None, strict=True)
    unit: Literal["C", "F"] | None = None
    method: str = Field(default="", max_length=100)
    source: Literal["manual"] = "manual"
    note: str = Field(default="", max_length=250)
    supersedes: UUID | None = None

    @model_validator(mode="after")
    def validate_kind(self):
        if self.kind == "storage":
            if self.storage is None or self.value is not None:
                raise ValueError("Storage required; no temperature value for a transition")
        else:
            if (
                self.storage is not None
                or self.value is None
                or self.unit is None
                or len(self.method.strip()) < 2
            ):
                raise ValueError("Measured value, unit and measurement method required")
            value_c = self.value if self.unit == "C" else (self.value - 32) * 5 / 9
            if not -100 <= value_c <= 300:
                raise ValueError("Measurement outside accepted input range")
        if self.supersedes and len(self.note.strip()) < 2:
            raise ValueError("Correction reason required")
        return self


class HandlingCommand(BaseModel):
    model_config = ConfigDict(extra="forbid")
    data: HandlingData
    request_id: UUID


@router.get("/qr")
async def qr(
    origin: str,
    mode: Literal["demo", "sandbox", "real"],
    batch: str = Query(pattern=r"^[A-Za-z0-9_-]{1,100}$"),
):
    allowed = {v.strip().rstrip("/") for v in getenv("ALLOWED_ORIGINS", "").split(",")}
    origin = origin.rstrip("/")
    if origin not in allowed:
        raise HTTPException(422, "Use the current approved local frontend origin")
    path = ("" if mode == "real" else "/" + mode) + "/passports/" + batch
    output = BytesIO()
    qrcode.make(origin + path, image_factory=qrcode.image.svg.SvgPathImage).save(output)
    return Response(
        output.getvalue(), media_type="image/svg+xml", headers={"Cache-Control": "no-store"}
    )


@router.get("/{batch_id}/history")
async def history(batch_id: UUID, member: Member):
    require(member, "vendor", "admin")
    return await member.repository.rpc("batch_handling_history", {"p_batch": str(batch_id)})


@router.post("/{batch_id}/records")
async def record(batch_id: UUID, body: HandlingCommand, member: Member):
    require(member, "vendor", "admin")
    result = await member.repository.rpc(
        "batch_handling_record",
        {
            "p_batch": str(batch_id),
            "p_data": body.data.model_dump(mode="json"),
            "p_request": str(body.request_id),
        },
    )
    return {"id": result}


@router.get("/{batch_id}")
async def passport(batch_id: UUID, repo: PublicRepository, response: Response):
    response.headers["Cache-Control"] = "no-store"
    result = await repo.rpc("batch_passport", {"p_batch": str(batch_id)})
    if not result:
        raise HTTPException(404, "Published batch passport not found")
    return result
