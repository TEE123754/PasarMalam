import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .contracts import (
    Actor,
    BatchInput,
    CheckInInput,
    ComplaintInput,
    DiscoverySnapshot,
    FavouriteInput,
    InventoryInput,
    ModerationInput,
    PromotionInput,
    ReviewInput,
)
from .repository import Repository
from .security import verify_token
from .settings import get_settings

router = APIRouter(prefix="/api/v1")
bearer = HTTPBearer(auto_error=False)
Credentials = Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]


def repository(credentials: Credentials) -> Repository:
    settings = get_settings()
    token = credentials.credentials if credentials else None
    if token:
        verify_token(token, settings)
    return Repository(settings, token)


@dataclass
class Access:
    actor: Actor
    repository: Repository


async def access(credentials: Credentials) -> Access:
    if not credentials:
        raise HTTPException(401, "Sign in required")
    settings = get_settings()
    user_id = verify_token(credentials.credentials, settings)
    repo = Repository(settings, credentials.credentials)
    profiles = await repo.read("profiles", "id,display_name,locale,verified_at", id=f"eq.{user_id}")
    if not profiles:
        raise HTTPException(403, "Account has not been provisioned")
    roles = await repo.read("user_roles", "role", user_id=f"eq.{user_id}")
    profile = profiles[0]
    return Access(
        Actor(
            id=user_id,
            display_name=profile["display_name"],
            locale=profile["locale"],
            verified=bool(profile["verified_at"]),
            roles=[row["role"] for row in roles],
        ),
        repo,
    )


Member = Annotated[Access, Depends(access)]
PublicRepository = Annotated[Repository, Depends(repository)]


def require(member: Access, *roles: str) -> None:
    if not set(roles).intersection(member.actor.roles):
        raise HTTPException(403, "This account cannot perform this action")


@router.get("/me", response_model=Actor, tags=["identity"])
async def me(member: Member) -> Actor:
    return member.actor


@router.get("/discovery", response_model=DiscoverySnapshot, tags=["public"])
async def discovery(repo: PublicRepository) -> DiscoverySnapshot:
    await repo.rpc("refresh_discovery_advisories", {})
    server_now = await repo.rpc("fresh_clock", {})
    markets = await repo.rpc("discovery_markets", {})
    kinds = await repo.read("markets", "id,kind", published="eq.true")
    market_kinds = {row["id"]: row["kind"] for row in kinds}
    stalls = await repo.read(
        "public_stalls",
        "id,market_id,name,category,specialty,price_sen,halal,open,photo,lot,opens,closes,latitude,longitude,description,declarations,declarations_recorded_at,category_id,availability_confirmed_at",
    )
    reviews = await repo.read("public_reviews", "id,stall_id,rating,body")
    claims = await repo.rpc("discovery_claims", {})
    menu = await repo.read(
        "food_items",
        "id,stall_id,name,price_sen,ingredients,photo,allergens,allergens_recorded_at,category_id,plant_diet,plant_diet_recorded_at",
        published="eq.true",
    )
    batches = await repo.read(
        "public_batches",
        "id,food_item_id,batch_number,prepared_at,uploaded_at,remaining_quantity,advisory_deadline,"
        "photo,corrected_prepared_at",
    )
    offers = await repo.read(
        "public_promotions", "id,stall_id,title,price_sen,original_price_sen,ends_at"
    )

    def photo_url(key):
        return f"{repo.url}/storage/v1/object/public/listing-media/{key}" if key else None

    stall_rows = []
    for stall in stalls:
        ratings = [row["rating"] for row in reviews if row["stall_id"] == stall["id"]]
        stall_rows.append(
            {
                "id": stall["id"],
                "marketId": stall["market_id"],
                "name": stall["name"],
                "category": stall["category"],
                "categoryId": stall.get("category_id"),
                "availabilityConfirmedAt": stall.get("availability_confirmed_at"),
                "specialty": stall["specialty"],
                "description": stall.get("description", ""),
                "declarations": stall.get("declarations"),
                "declarationsRecordedAt": stall.get("declarations_recorded_at"),
                "priceSen": stall["price_sen"],
                "rating": sum(ratings) / len(ratings) if ratings else 0,
                "reviews": len(ratings),
                "image": "🍴",
                "photoUrl": photo_url(stall.get("photo")),
                "lot": stall.get("lot", ""),
                "opens": stall.get("opens"),
                "closes": stall.get("closes"),
                "latitude": stall.get("latitude"),
                "longitude": stall.get("longitude"),
                "halal": stall["halal"],
                "open": stall["open"],
                "claims": [
                    {
                        "foodItemId": c["food_item_id"],
                        "status": c["status"],
                        "expiresAt": c["expires_at"],
                        "reviewedAt": c["reviewed_at"],
                        "evidence": c["evidence"],
                    }
                    for c in claims
                    if c["stall_id"] == stall["id"]
                ],
            }
        )
    return DiscoverySnapshot.model_validate(
        {
            "markets": [
                {
                    **row,
                    "kind": market_kinds.get(row["id"], "general"),
                    "cover": "🌙" if row["type"] == "night" else "☀️",
                    "stallCount": sum(s["market_id"] == row["id"] for s in stalls),
                }
                for row in markets
            ],
            "stalls": stall_rows,
            "offers": [
                {
                    "id": row["id"],
                    "stallId": row["stall_id"],
                    "title": row["title"],
                    "priceSen": row["price_sen"],
                    "originalPriceSen": row["original_price_sen"],
                    "endsAt": row["ends_at"],
                }
                for row in offers
            ],
            "updatedAt": datetime.now(timezone.utc),
            "server_now": server_now,
            "menu": [
                {
                    "id": f["id"],
                    "stallId": f["stall_id"],
                    "name": f["name"],
                    "priceSen": f["price_sen"],
                    "ingredients": f["ingredients"],
                    "categoryId": f.get("category_id"),
                    "plantDiet": f.get("plant_diet"),
                    "plantDietRecordedAt": f.get("plant_diet_recorded_at"),
                    "allergens": f.get("allergens"),
                    "allergensRecordedAt": f.get("allergens_recorded_at"),
                    "photoUrl": photo_url(f.get("photo")),
                }
                for f in menu
            ],
            "batches": [
                {
                    "id": b["id"],
                    "foodItemId": b["food_item_id"],
                    "batchNumber": b["batch_number"],
                    "preparedAt": b["prepared_at"],
                    "uploadedAt": b["uploaded_at"],
                    "remaining": b["remaining_quantity"],
                    "deadline": b["advisory_deadline"],
                    "photoUrl": photo_url(b.get("photo")),
                    "correctedPreparedAt": b.get("corrected_prepared_at"),
                }
                for b in batches
            ],
            "publicReviews": [
                {"id": r["id"], "stallId": r["stall_id"], "rating": r["rating"], "body": r["body"]}
                for r in reviews
            ],
        }
    )


@router.get("/discovery/nearby", tags=["public"])
async def nearby(
    repo: PublicRepository,
    lat: float = Query(ge=-90, le=90),
    lon: float = Query(ge=-180, le=180),
    radius: int = Query(default=50000, ge=1, le=100000),
    south: float = Query(default=-90, ge=-90, le=90),
    west: float = Query(default=-180, ge=-180, le=180),
    north: float = Query(default=90, ge=-90, le=90),
    east: float = Query(default=180, ge=-180, le=180),
) -> list[dict]:
    if south > north or west > east:
        raise HTTPException(422, "Invalid map bounds")
    # Only coarse/manual origins are accepted: a caller cannot persist precise shopper GPS.
    return await repo.rpc(
        "nearby_markets",
        {
            "p_lat": round(lat, 2),
            "p_lon": round(lon, 2),
            "p_radius": radius,
            "p_south": south,
            "p_west": west,
            "p_north": north,
            "p_east": east,
        },
    )


@router.get("/me/favourites", tags=["protected"])
async def favourites(member: Member) -> list[str]:
    require(member, "customer")
    rows = await member.repository.read("favourites", "stall_id", owner_id=f"eq.{member.actor.id}")
    return [row["stall_id"] for row in rows]


@router.post("/me/favourites", tags=["protected"])
async def favourite(body: FavouriteInput, member: Member) -> dict:
    require(member, "customer")
    saved = await member.repository.rpc(
        "set_favourite", {"p_stall_id": str(body.stall_id), "p_saved": body.saved}
    )
    return {"saved": saved}


@router.post("/me/check-ins", tags=["protected"])
async def check_in(body: CheckInInput, member: Member) -> dict:
    require(member, "customer")
    created = await member.repository.rpc("check_in", {"p_market_id": str(body.market_id)})
    return {"created": created}


@router.post("/batches", tags=["protected"])
async def create_batch(body: BatchInput, member: Member) -> dict:
    require(member, "vendor", "admin")
    if len(json.dumps(body.handling)) > 10000:
        raise HTTPException(422, "Handling declaration is too large")
    result = await member.repository.rpc(
        "create_batch",
        {
            "p_food_item_id": str(body.food_item_id),
            "p_prepared_at": body.prepared_at.isoformat(),
            "p_quantity": body.quantity,
            "p_handling": body.handling,
            "p_request_id": str(body.request_id),
        },
    )
    return {"id": result}


@router.post("/batches/{batch_id}/inventory", tags=["protected"])
async def inventory(batch_id: UUID, body: InventoryInput, member: Member) -> dict:
    require(member, "vendor", "admin")
    result = await member.repository.rpc(
        "change_inventory",
        {
            "p_batch_id": str(batch_id),
            "p_delta": body.delta,
            "p_request_id": str(body.request_id),
        },
    )
    return {"remaining_quantity": result}


@router.post("/batches/{batch_id}/promotions", tags=["protected"])
async def promote(batch_id: UUID, body: PromotionInput, member: Member) -> dict:
    require(member, "vendor", "admin")
    result = await member.repository.rpc(
        "create_promotion",
        {
            "p_batch_id": str(batch_id),
            "p_title": body.title,
            "p_price_sen": body.price_sen,
            "p_quantity": body.quantity,
            "p_ends_at": body.ends_at.isoformat(),
            "p_request_id": str(body.request_id),
        },
    )
    return {"id": result}


@router.post("/reviews", tags=["protected"])
async def review(body: ReviewInput, member: Member) -> dict:
    require(member, "customer")
    result = await member.repository.rpc(
        "community_command",
        {
            "p_kind": "review",
            "p_data": {"stall": str(body.stall_id), "rating": body.rating, "body": body.body},
            "p_request": str(uuid4()),
        },
    )
    return {"id": result}


@router.post("/complaints", tags=["protected"])
async def complaint(body: ComplaintInput, member: Member) -> dict:
    require(member, "customer")
    if not member.actor.verified:
        raise HTTPException(403, "Verified account required")
    if body.incident_at is None:
        raise HTTPException(422, "Explicit incident time required")
    result = await member.repository.rpc(
        "community_command",
        {
            "p_kind": "report",
            "p_data": {
                "stall": str(body.stall_id),
                "body": body.body,
                "evidence": body.evidence_keys,
                "category": body.category,
                "incident": body.incident_at.isoformat(),
            },
            "p_request": str(body.request_id),
        },
    )
    return {"id": result}


@router.post("/complaints/{complaint_id}/moderation", tags=["protected"])
async def moderate(complaint_id: UUID, body: ModerationInput, member: Member) -> dict:
    require(member, "admin")
    await member.repository.rpc(
        "community_command",
        {
            "p_kind": "status",
            "p_data": {
                "target": str(complaint_id),
                "status": body.status,
                "reason": "Legacy operator status decision",
            },
            "p_request": str(body.request_id),
        },
    )
    return {"status": body.status}


@router.get("/admin/summary", tags=["protected"])
async def admin_summary(member: Member) -> dict:
    require(member, "admin")
    reports = await member.repository.read("complaints", "id,status")
    return {
        "pending_reports": sum(row["status"] == "submitted" for row in reports),
        "is_demo": True,
    }
