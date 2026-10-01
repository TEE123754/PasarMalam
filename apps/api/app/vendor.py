"""Vendor operations use caller JWTs; media signatures authorize decoded, immutable JPEGs."""

import hashlib
import hmac
import warnings
from io import BytesIO
from os import getenv
from typing import Literal
from uuid import UUID, uuid4

import httpx
from fastapi import APIRouter, HTTPException, Request
from PIL import Image, ImageOps, UnidentifiedImageError
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, StrictInt, model_validator

from .contracts import Money
from .routes import Member, require

router = APIRouter(prefix="/api/v1/vendor", tags=["vendor"])


class StallInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: UUID
    market_id: UUID
    name: str = Field(min_length=2, max_length=100)
    category: str = Field(min_length=1, max_length=60)
    specialty: str = Field(min_length=1, max_length=150)
    price_sen: Money
    halal: Literal["declared", "non-halal", "not-declared"]
    open: bool
    lot: str = Field(max_length=60)
    opens: str = Field(pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$")
    closes: str = Field(pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$")
    latitude: float | None = Field(ge=-90, le=90)
    longitude: float | None = Field(ge=-180, le=180)
    photo: str | None = Field(max_length=150)

    @model_validator(mode="after")
    def coordinate_pair(self):
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("Both coordinates required")
        return self


class FoodInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: UUID
    stall_id: UUID
    name: str = Field(min_length=2, max_length=100)
    price_sen: Money
    ingredients: list[str] = Field(max_length=40)
    photo: str | None = Field(max_length=150)


class Handling(BaseModel):
    storage: Literal["ambient", "chilled", "hot-held", "unknown"]
    note: str = Field(max_length=500)


class NewBatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    food_item_id: UUID
    prepared_at: AwareDatetime
    quantity: StrictInt | None = Field(ge=1, le=100000)
    handling: Handling
    photo: str | None = Field(max_length=150)


class Action(BaseModel):
    model_config = ConfigDict(extra="forbid")
    batch_id: UUID
    action: Literal["consume", "sold-out", "withdrawn", "discarded", "available", "correct"]
    quantity: StrictInt | None = Field(default=None, ge=1, le=100000)
    prepared_at: AwareDatetime | None = None


class Merge(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source_ids: list[UUID] = Field(min_length=2, max_length=20)


class VendorCommand(BaseModel):
    kind: Literal["stall", "food", "batch", "action", "merge"]
    data: dict
    request_id: UUID


@router.get("/workspace")
async def workspace(member: Member) -> dict:
    require(member, "vendor", "admin")
    return await member.repository.rpc("vendor_workspace", {})


@router.post("/command")
async def command(body: VendorCommand, member: Member) -> dict:
    require(member, "vendor", "admin")
    model = {
        "stall": StallInput,
        "food": FoodInput,
        "batch": NewBatch,
        "action": Action,
        "merge": Merge,
    }[body.kind]
    try:
        data = model.model_validate(body.data).model_dump(mode="json", exclude_none=False)
    except ValueError as error:
        raise HTTPException(422, "Invalid vendor form") from error
    # Optional action fields are absent in browser commands; canonical RPC input is stable.
    if body.kind == "action":
        data = {key: value for key, value in data.items() if value is not None}
    result = await member.repository.rpc(
        "vendor_command",
        {"p_kind": body.kind, "p_data": data, "p_request_id": str(body.request_id)},
    )
    return {"id": result}


def normalize_photo(content: bytes) -> bytes:
    if len(content) > 5242880:
        raise HTTPException(413, "Photo exceeds 5 MB")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(content)) as image:
                if image.format not in {"JPEG", "PNG", "WEBP"}:
                    raise ValueError("Unsupported content")
                if image.width * image.height > 16000000 or min(image.size) < 32:
                    raise ValueError("Invalid dimensions")
                image.load()  # Reject truncated data; do not trust MIME/extensions.
                upright = ImageOps.exif_transpose(image)
                upright.thumbnail((1280, 1280))
                # A new RGB image carries no original EXIF, GPS, ICC or textual metadata.
                clean = Image.new("RGB", upright.size, "white")
                converted = upright.convert("RGBA")
                clean.paste(converted, mask=converted.getchannel("A"))
                output = BytesIO()
                clean.save(output, "JPEG", quality=80, optimize=True)
                data = output.getvalue()
                if len(data) > 1048576:
                    raise ValueError("Compressed photo too large")
                return data
    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
        Image.DecompressionBombError,
        Image.DecompressionBombWarning,
    ) as error:
        raise HTTPException(422, "Invalid or oversized image contents") from error


async def storage_request(member: Member, method: str, path: str, **kwargs):
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=False) as client:
            response = await client.request(
                method,
                f"{member.repository.url}/storage/v1/{path}",
                headers=member.repository.headers,
                **kwargs,
            )
        if response.is_error:
            raise HTTPException(502, "Media service rejected the operation")
        return response
    except httpx.HTTPError as error:
        raise HTTPException(503, "Media service unavailable") from error


class Cleanup(BaseModel):
    key: str = Field(max_length=150, pattern=r"^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.jpg$")


@router.post("/photos/cleanup")
async def cleanup(body: Cleanup, member: Member) -> dict:
    require(member, "vendor", "admin")
    await member.repository.rpc("check_listing_cleanup", {"p_key": body.key})
    # Storage's immutable-attachment policy rejects deletion of a committed batch photo.
    await storage_request(member, "DELETE", "object/listing-media", json={"prefixes": [body.key]})
    return {"removed": True}


@router.post("/photos/{stall_id}")
async def upload(stall_id: UUID, request: Request, member: Member) -> dict:
    require(member, "vendor", "admin")
    secret = getenv("MEDIA_SIGNING_SECRET", "")
    if len(secret) < 32:
        raise HTTPException(503, "Validated media authorization is not configured")
    chunks = bytearray()
    async for chunk in request.stream():
        chunks.extend(chunk)
        if len(chunks) > 5242880:
            raise HTTPException(413, "Photo exceeds 5 MB")
    image = normalize_photo(bytes(chunks))
    key = f"{stall_id}/{member.actor.id}/{uuid4()}.jpg"

    async def attest(stage: str):
        signature = hmac.new(secret.encode(), f"{stage}:{key}".encode(), hashlib.sha256).hexdigest()
        await member.repository.rpc(
            "authorize_listing_photo", {"p_key": key, "p_stage": stage, "p_signature": signature}
        )

    await attest("authorize")
    try:
        # Fixed upload endpoint; filename cannot redirect to private evidence buckets.
        # No upsert header. Storage authorizes only this actor's fresh, signed ticket.
        headers = dict(member.repository.headers)
        headers["Content-Type"] = "image/jpeg"
        async with httpx.AsyncClient(timeout=30, follow_redirects=False) as client:
            response = await client.post(
                f"{member.repository.url}/storage/v1/object/listing-media/{key}",
                headers=headers,
                content=image,
            )
        if response.is_error:
            raise HTTPException(502, "Photo upload failed")
        await attest("complete")
    except (httpx.HTTPError, HTTPException) as error:
        try:
            await storage_request(
                member, "DELETE", "object/listing-media", json={"prefixes": [key]}
            )
        except HTTPException:
            pass  # Unattached orphan is never referenced by a public listing.
        raise HTTPException(503, "Upload failed; no listing was created") from error
    return {"key": key}
