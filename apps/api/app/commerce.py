"""Fictional commerce: validated commands, caller JWT RPCs, no provider credentials."""

from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, StrictInt, TypeAdapter

from .routes import Member, PublicRepository

router = APIRouter(prefix="/api/v1/commerce", tags=["commerce-simulation"])


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Onboard(Input):
    kind: Literal["onboard"]
    name: str = Field(min_length=2, max_length=100)
    business: str = Field(min_length=2, max_length=100)


class Reserve(Input):
    kind: Literal["reserve"]
    offer: UUID
    quantity: StrictInt = Field(ge=1, le=100)
    fulfilment: Literal["pickup", "delivery"]
    payment: Literal["stall", "future"]
    eta: StrictInt = Field(ge=0, le=60)


class Order(Input):
    kind: Literal["order"]
    id: UUID
    action: Literal[
        "accept", "reject", "ready", "cancel", "vendor-confirm", "customer-confirm", "dispute"
    ]
    code: str | None = Field(default=None, max_length=30)


class Payment(Input):
    kind: Literal["payment"]
    id: UUID
    scenario: Literal["success", "failure", "timeout", "late"]


class Refund(Input):
    kind: Literal["refund"]
    id: UUID
    amount: StrictInt = Field(ge=1, le=100000000)


class Campaign(Input):
    kind: Literal["campaign"]
    stall: UUID
    market: UUID
    category: str = Field(min_length=1, max_length=60)
    radius: StrictInt = Field(ge=1, le=50)
    start: AwareDatetime
    end: AwareDatetime
    budget: StrictInt = Field(ge=1, le=10000000)
    placement: Literal["sponsored", "banner", "native", "interstitial"]
    description: str = Field(min_length=1, max_length=300)


class Moderate(Input):
    kind: Literal["moderate"]
    id: UUID
    action: Literal["approved", "rejected", "paused", "resume"]


class Ad(Input):
    kind: Literal["ad"]
    id: UUID
    event: Literal["impression", "click"]


class Subscription(Input):
    kind: Literal["subscription"]
    tier: Literal["free", "premium", "renewal-failed"]


class Rate(Input):
    kind: Literal["rate"]
    basisPoints: StrictInt = Field(ge=0, le=1000)


class Delivery(Input):
    kind: Literal["delivery"]
    id: UUID
    action: Literal["accepted", "picked-up", "arrived", "failed", "cancelled"]


Action = Annotated[
    Onboard
    | Reserve
    | Order
    | Payment
    | Refund
    | Campaign
    | Moderate
    | Ad
    | Subscription
    | Rate
    | Delivery,
    Field(discriminator="kind"),
]
action_adapter = TypeAdapter(Action)


class Command(Input):
    action: Action
    request_id: UUID


@router.get("/workspace")
async def workspace(member: Member):
    return await member.repository.rpc("commerce_workspace", {})


@router.get("/ads")
async def ads(repo: PublicRepository):
    return await repo.rpc("commerce_ads", {})


@router.post("/command")
async def command(body: Command, member: Member):
    result = await member.repository.rpc(
        "commerce_command",
        {
            "p_data": body.action.model_dump(mode="json", exclude_none=True),
            "p_request": str(body.request_id),
        },
    )
    return {"id": result, "provider_mode": "simulated"}
