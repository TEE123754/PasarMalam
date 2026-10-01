"""Initial versioned contracts shared by fixture and connected discovery."""

from typing import Annotated, Literal
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, Field, StrictInt


class Market(BaseModel):
    id: str
    name: str
    area: str
    type: Literal["night", "day"]
    hours: str
    days: str
    cover: str
    stallCount: int
    status: Literal["open", "upcoming", "closed"]


class Stall(BaseModel):
    id: str
    marketId: str
    name: str
    category: str
    specialty: str
    priceSen: int
    rating: float
    reviews: int
    image: str
    halal: Literal["declared", "non-halal", "not-declared"]
    open: bool


class Offer(BaseModel):
    id: str
    stallId: str
    title: str
    priceSen: int
    originalPriceSen: int
    endsAt: str


class DiscoverySnapshot(BaseModel):
    markets: list[Market]
    stalls: list[Stall]
    offers: list[Offer]
    updatedAt: AwareDatetime


class Actor(BaseModel):
    id: UUID
    display_name: str
    locale: Literal["en", "ms"]
    verified: bool
    roles: list[Literal["customer", "vendor", "admin", "partner", "organiser"]]


PositiveInt = Annotated[StrictInt, Field(gt=0, le=100000)]
Money = Annotated[StrictInt, Field(ge=0, le=100000000)]


class BatchInput(BaseModel):
    food_item_id: UUID
    prepared_at: AwareDatetime
    quantity: PositiveInt
    handling: dict = Field(default_factory=dict)
    request_id: UUID


class InventoryInput(BaseModel):
    delta: Annotated[StrictInt, Field(lt=0, ge=-100000)]
    request_id: UUID


class PromotionInput(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    price_sen: Money
    quantity: PositiveInt
    ends_at: AwareDatetime
    request_id: UUID


class ReviewInput(BaseModel):
    stall_id: UUID
    rating: Annotated[StrictInt, Field(ge=1, le=5)]
    body: str = Field(min_length=1, max_length=1500)


class ComplaintInput(BaseModel):
    stall_id: UUID
    body: str = Field(min_length=10, max_length=2000)
    evidence_keys: list[str] = Field(default_factory=list, max_length=3)
    request_id: UUID


class ModerationInput(BaseModel):
    status: Literal["triaged", "dismissed", "escalated"]
    request_id: UUID
