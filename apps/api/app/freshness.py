"""Caller-scoped advisory mutations. Synthetic policy is restricted to the sandbox."""

import asyncio
from datetime import datetime, timezone
from os import getenv
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, StrictInt

from .routes import Member, require
from .weather import signed_weather, weather_payload

router = APIRouter(prefix="/api/v1/freshness", tags=["freshness"])


class Action(BaseModel):
    model_config = ConfigDict(extra="forbid")
    request_id: UUID


class Declaration(Action):
    batch: UUID
    ingredients: list[str] = Field(min_length=1, max_length=50)
    confirmed: bool
    ambient: bool


class Publish(Action):
    batch: UUID
    kind: Literal["percentage", "fixed", "free", "bogo"]
    value: StrictInt = Field(ge=0, le=100000000)
    units: StrictInt = Field(ge=1, le=100000)
    title: str = Field(min_length=2, max_length=100)


class Consent(Action):
    enabled: bool
    market: UUID | None = None


class Read(Action):
    id: UUID


class Outcome(Action):
    batch: UUID
    promotion: UUID | None = None
    units: StrictInt = Field(ge=0, le=100000)
    grams: StrictInt = Field(ge=0, le=100000000)


class Clock(Action):
    at: AwareDatetime


class Weather(Action):
    market: UUID


@router.post("/clock")
async def clock(body: Clock, member: Member):
    require(member, "admin")
    return await member.repository.rpc("advisory_time_override", {"p_at": body.at.isoformat()})


@router.post("/weather")
async def weather(body: Weather, member: Member):
    require(member, "vendor", "admin")
    context = await member.repository.rpc("weather_context", {"p_market": str(body.market)})
    if not context:
        raise HTTPException(404, "Published market not found")
    cached = context.get("cached")
    if cached and cached["provider"] == getenv("WEATHER_MODE", "fixture"):
        age = (
            datetime.now(timezone.utc) - datetime.fromisoformat(cached["created_at"])
        ).total_seconds()
        if 0 <= age < 900:
            return {"cached": True}
    secret = getenv("AGENT_DISPATCH_SECRET", "")
    if len(secret) < 32:
        raise HTTPException(503, "Trusted weather persistence is not configured")
    try:
        payload = await asyncio.to_thread(
            weather_payload, str(body.market), context["latitude"], context["longitude"]
        )
        text, signature = signed_weather(payload, secret)
    except Exception as error:
        raise HTTPException(503, "Weather unavailable; conservative rules remain active") from error
    await member.repository.rpc(
        "store_market_weather", {"p_payload": text, "p_signature": signature}
    )
    return {"cached": False, "source": payload["source"]}


@router.get("/workspace")
async def workspace(member: Member):
    require(member, "vendor", "admin")
    return await member.repository.rpc("fresh_workspace", {})


@router.post("/confirm")
async def confirm(body: Declaration, member: Member):
    require(member, "vendor", "admin")
    return await member.repository.rpc(
        "confirm_advisory",
        {
            "p_batch": str(body.batch),
            "p_ingredients": body.ingredients,
            "p_confirmed": body.confirmed,
            "p_ambient": body.ambient,
            "p_request": str(body.request_id),
        },
    )


@router.post("/publish")
async def publish(body: Publish, member: Member):
    require(member, "vendor", "admin")
    return await member.repository.rpc(
        "publish_clearance",
        {
            "p_batch": str(body.batch),
            "p_kind": body.kind,
            "p_value": body.value,
            "p_units": body.units,
            "p_title": body.title,
            "p_request": str(body.request_id),
        },
    )


@router.post("/consent")
async def consent(body: Consent, member: Member):
    require(member, "customer", "admin")
    return await member.repository.rpc(
        "set_clearance_consent",
        {
            "p_enabled": body.enabled,
            "p_market": str(body.market) if body.market else None,
        },
    )


@router.post("/read")
async def read(body: Read, member: Member):
    return await member.repository.rpc("mark_advisory_read", {"p_id": str(body.id)})


@router.post("/outcome")
async def outcome(body: Outcome, member: Member):
    require(member, "vendor", "admin")
    return await member.repository.rpc(
        "record_clearance_outcome",
        {
            "p_batch": str(body.batch),
            "p_promotion": str(body.promotion) if body.promotion else None,
            "p_units": body.units,
            "p_grams": body.grams,
            "p_request": str(body.request_id),
        },
    )
