"""Guarded CP2 SQL, owner mutation and public-contract acceptance."""

import os
from uuid import uuid4

import pytest
from test_cp1_live import connected as connected
from test_cp1_live import listing as listing

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_CP2") != "1", reason="Explicit CP2 disposable gate required"
    ),
]


def test_farmer_market_public_contract_and_category_backfill(connected):
    c, api, _, _ = connected
    response = api.get("/api/v1/discovery")
    assert response.status_code == 200
    d = response.json()
    m = next(m for m in d["markets"] if m["id"] == "c0200000-0000-4000-8000-000000000001")
    assert m["kind"] == "farmers" and m["type"] == "day" and len(m["schedules"]) == 7
    f = next(f for f in d["menu"] if f["id"] == "c0200000-0000-4000-8000-000000000003")
    assert f["categoryId"] == "produce" and f["plantDiet"] == {"vegetarian": "yes", "vegan": "yes"}
    assert (
        c.execute(
            "select count(*) from public.categories where id in "
            "('rice','skewers','kuih','drinks','fried','produce')"
        ).fetchone()[0]
        == 6
    )
    assert (
        c.execute(
            "select count(*) from public.food_items where category_id is null and stall_id in "
            "(select id from public.stalls where category_id is not null)"
        ).fetchone()[0]
        == 0
    )


def test_confirmation_is_owner_only_idempotent_and_not_refresh_time(listing):
    c, api, _, _, stall, _, save = listing
    request = uuid4()
    value = {
        **stall,
        "confirm_availability": True,
        "availability_confirmed_at": "2099-01-01T00:00:00Z",
    }
    assert save("stall", value, key=request).status_code == 200
    at = c.execute(
        "select availability_confirmed_at from public.stalls where id=%s", (stall["id"],)
    ).fetchone()[0]
    assert at.year == 2026
    assert save("stall", value, key=request).status_code == 200
    assert save("stall", {**stall, "description": "Edited"}).status_code == 200
    api.get("/api/v1/discovery")
    assert (
        c.execute(
            "select availability_confirmed_at from public.stalls where id=%s", (stall["id"],)
        ).fetchone()[0]
        == at
    )
    assert save("stall", value, persona="vendor-b").status_code in (400, 403, 502)
    assert save("stall", {**stall, "open": False}).status_code == 200
    assert (
        c.execute(
            "select availability_confirmed_at from public.stalls where id=%s", (stall["id"],)
        ).fetchone()[0]
        is None
    )


def test_plant_declarations_reset_on_ingredients_and_allow_explicit_reconfirmation(listing):
    c, api, _, sessions, stall, food, save = listing
    value = {**food, "category_id": "fried", "plant_diet": {"vegetarian": "yes", "vegan": "yes"}}
    assert save("food", value).status_code == 200

    def row():
        return c.execute(
            "select category_id,plant_diet,plant_diet_recorded_at "
            "from public.food_items where id=%s",
            (food["id"],),
        ).fetchone()

    assert row()[0] == "fried" and row()[2] is not None
    assert save("food", {**food, "ingredients": ["changed"]}).status_code == 200
    assert row()[1] == {"vegetarian": "unknown", "vegan": "unknown"} and row()[2] is None
    assert save("food", {**value, "ingredients": ["changed"]}).status_code == 200
    assert row()[1]["vegan"] == "yes"
    workspace = api.get("/api/v1/vendor/workspace", headers=sessions["vendor-a"]).json()
    f = next(f for f in workspace["foods"] if f["id"] == food["id"])
    assert f["category_id"] == "fried" and f["plant_diet"]["vegan"] == "yes"
    d = api.get("/api/v1/discovery").json()
    assert next(f for f in d["menu"] if f["id"] == food["id"])["plantDietRecordedAt"]
    assert (
        save("food", {**value, "plant_diet": {"vegetarian": "no", "vegan": "yes"}}).status_code
        == 200
    )
    assert save("food", {**value, "category_id": "made-up"}).status_code == 422
