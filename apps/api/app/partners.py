"""Internal fictional partner workflows. Caller JWT determines all scopes."""

from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field, TypeAdapter

from .routes import Member, PublicRepository

router = APIRouter(prefix="/api/v1/partners", tags=["partners"])


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Application(Strict):
    kind: Literal["collaboration", "permit", "claim"]
    stall: UUID
    org: UUID
    body: str = Field(min_length=3, max_length=1500)


class Referral(Strict):
    kind: Literal["referral"]
    report: UUID
    org: UUID
    summary: str = Field(min_length=3, max_length=1500)
    consent: bool = Field(strict=True)


class Collection(Strict):
    kind: Literal["collection"]
    batch: UUID
    org: UUID
    route: Literal["donation", "compost", "bsf"]
    units: int = Field(strict=True, ge=1, le=100000)
    estimatedGrams: int = Field(strict=True, ge=0, le=10000000)


class Trail(Strict):
    kind: Literal["trail"]
    org: UUID
    body: str = Field(min_length=3, max_length=1500)
    stops: list[UUID] = Field(min_length=2, max_length=5)


class Transition(Strict):
    kind: Literal["transition"]
    id: UUID
    action: Literal[
        "submit",
        "approve",
        "reject",
        "changes",
        "publish",
        "acknowledge",
        "schedule",
        "inspect",
        "corrective",
        "follow-up",
        "resolve",
        "renew",
        "review",
        "cancel",
        "accept",
        "collect",
        "missed",
    ]
    body: str | None = Field(default=None, min_length=3, max_length=1500)
    scheduled: str | None = Field(default=None, max_length=50)
    checklist: list[Literal["handling", "storage", "cleaning", "labels"]] | None = Field(
        default=None, max_length=8
    )
    weighedGrams: int | None = Field(default=None, strict=True, ge=0, le=10000000)
    scenario: Literal["success", "pending", "rejection", "timeout"] | None = None


Action = Annotated[
    Application | Referral | Collection | Trail | Transition, Field(discriminator="kind")
]
action_adapter = TypeAdapter(Action)


class Command(Strict):
    action: Action
    request_id: UUID


@router.get("/workspace")
async def workspace(member: Member):
    return await member.repository.rpc("partners_workspace", {})


@router.get("/public")
async def public(repo: PublicRepository):
    return await repo.rpc("partners_public", {})


@router.post("/command")
async def command(body: Command, member: Member):
    result = await member.repository.rpc(
        "partners_command",
        {
            "p_data": body.action.model_dump(mode="json", exclude_none=True),
            "p_request": str(body.request_id),
        },
    )
    return {"id": result, "provider_mode": "simulated"}
