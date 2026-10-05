"""Initial versioned contracts shared by fixture and connected discovery."""

from typing import Annotated, Literal
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, Field, StrictInt


class Schedule(BaseModel):
    weekday: int = Field(ge=0, le=6)
    opens: str
    closes: str
    nextDay: bool = False


class ScheduleException(BaseModel):
    date: str
    cancelled: bool
    opens: str | None = None
    closes: str | None = None


class DietaryClaim(BaseModel):
    foodItemId: str | None = None
    status: Literal["declared", "certified", "non-halal", "not-declared"]
    expiresAt: AwareDatetime | None = None
    reviewedAt: AwareDatetime | None = None
    evidence: bool = False


class MenuItem(BaseModel):
    id: str
    stallId: str
    name: str
    priceSen: int
    ingredients: list[str]
    photoUrl: str | None = None


class PublicBatch(BaseModel):
    id: str
    foodItemId: str
    batchNumber: int
    preparedAt: AwareDatetime
    uploadedAt: AwareDatetime
    remaining: int
    deadline: AwareDatetime
    photoUrl: str | None = None
    correctedPreparedAt: AwareDatetime | None = None


class PublicReview(BaseModel):
    id: str
    stallId: str
    rating: int
    body: str


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
    latitude: float | None = None
    longitude: float | None = None
    schedules: list[Schedule] = Field(default_factory=list)
    exceptions: list[ScheduleException] = Field(default_factory=list)
    popularity: int = 0
    version: int = 0


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
    photoUrl: str | None = None
    halal: Literal["declared", "non-halal", "not-declared"]
    open: bool
    claims: list[DietaryClaim] = Field(default_factory=list)
    aliases: list[str] = Field(default_factory=list)
    lot: str = ""
    opens: str | None = None
    closes: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class Offer(BaseModel):
    id: str
    stallId: str
    title: str
    priceSen: int
    originalPriceSen: int
    endsAt: str


class DiscoverySnapshot(BaseModel):
    server_now: AwareDatetime | None = None
    markets: list[Market]
    stalls: list[Stall]
    offers: list[Offer]
    updatedAt: AwareDatetime
    menu: list[MenuItem] = Field(default_factory=list)
    batches: list[PublicBatch] = Field(default_factory=list)
    publicReviews: list[PublicReview] = Field(default_factory=list)


class FavouriteInput(BaseModel):
    stall_id: UUID
    saved: bool


class CheckInInput(BaseModel):
    market_id: UUID


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
    incident_at: AwareDatetime | None = None
    category: Literal["hygiene", "handling", "misleading", "other"] = "hygiene"


class ModerationInput(BaseModel):
    status: Literal["triaged", "dismissed", "escalated"]
    request_id: UUID
