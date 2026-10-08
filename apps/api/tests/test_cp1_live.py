"""CP1 connected gate: new disposable fixtures only; no reseed or email delivery."""

import json
import os
from uuid import uuid4

import httpx
import psycopg
import pytest
from app.main import app
from app.settings import get_settings
from demo_db import target_configuration, verify_marker
from fastapi.testclient import TestClient

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_CP1") != "1", reason="Explicit CP1 disposable gate required"
    ),
]


@pytest.fixture(scope="module")
def connected():
    _, url, database = target_configuration()
    with psycopg.connect(database, autocommit=True, connect_timeout=10) as connection:
        verify_marker(connection)
        settings = get_settings()
        with httpx.Client(
            base_url=url, headers={"apikey": settings.publishable_key}, timeout=20
        ) as direct:
            sessions = {}
            for persona in ["vendor-a", "vendor-b"]:
                result = direct.post(
                    "/auth/v1/token?grant_type=password",
                    json={
                        "email": f"{persona}@pasarmalam.invalid",
                        "password": os.environ["DEMO_SEED_PASSWORD"],
                    },
                )
                assert result.status_code == 200, "Fictional account sign-in failed"
                sessions[persona] = {"Authorization": f"Bearer {result.json()['access_token']}"}
            yield connection, TestClient(app), direct, sessions


def send(api, headers, kind, data, request=None):
    return api.post(
        "/api/v1/vendor/command",
        headers=headers,
        json={"kind": kind, "data": data, "request_id": str(request or uuid4())},
    )


@pytest.fixture
def listing(connected):
    c, api, direct, sessions = connected
    market = c.execute(
        "select id from public.markets where published order by id limit 1"
    ).fetchone()[0]
    stall = {
        "id": str(uuid4()),
        "market_id": str(market),
        "name": "CP1 Fictional stall",
        "category": "Rice",
        "specialty": "Rice",
        "price_sen": 500,
        "halal": "not-declared",
        "open": True,
        "lot": "CP1-test",
        "opens": "17:00",
        "closes": "22:00",
        "latitude": None,
        "longitude": None,
        "photo": None,
        "description": "Small fictional batches; ask about ingredients.",
        "declarations": {"pork_free": "yes", "alcohol_free": "yes", "muslim_owned": "unknown"},
    }
    food = {
        "id": str(uuid4()),
        "stall_id": stall["id"],
        "name": "CP1 Fictional rice",
        "price_sen": 500,
        "ingredients": ["rice", "milk"],
        "photo": None,
        "allergens": {"status": "confirmed", "contains": ["milk"], "cross_contact": "possible"},
    }
    keys = []

    def save(kind, value, persona="vendor-a", key=None):
        request = key or uuid4()
        keys.append(request)
        return send(api, sessions[persona], kind, value, request)

    try:
        assert save("stall", stall).status_code == 200
        assert save("food", food).status_code == 200
        yield c, api, direct, sessions, stall, food, save
    finally:
        c.execute("delete from public.food_items where id=%s", (food["id"],))
        c.execute("delete from public.stall_memberships where stall_id=%s", (stall["id"],))
        c.execute("delete from public.stalls where id=%s", (stall["id"],))
        c.execute("delete from private.vendor_requests where request_id=any(%s::uuid[])", (keys,))


def test_roundtrip_public_metadata_owner_denial_and_retry(listing):
    c, api, _, sessions, stall, food, save = listing
    public = api.get("/api/v1/discovery")
    assert public.status_code == 200
    visible = next(s for s in public.json()["stalls"] if s["id"] == stall["id"])
    assert visible["description"] == stall["description"]
    assert visible["declarations"] == stall["declarations"]
    assert not visible["claims"], "Declarations must not create a certificate"
    menu = next(f for f in public.json()["menu"] if f["id"] == food["id"])
    assert menu["allergens"] == food["allergens"] and menu["allergensRecordedAt"]
    assert "actor_id" not in menu
    assert save("stall", stall, "vendor-b").status_code == 403
    assert save("food", food, "vendor-b").status_code == 403
    current = api.get("/api/v1/vendor/workspace", headers=sessions["vendor-a"]).json()
    item = next(f for f in current["foods"] if f["id"] == food["id"])
    key = uuid4()
    update = {
        **item,
        "allergens": {
            "status": "confirmed",
            "contains": ["milk", "soy"],
            "cross_contact": "unknown",
        },
        "allergens_recorded_at": "2000-01-01T00:00:00Z",
    }
    assert save("food", update, key=key).status_code == 200
    clock = c.execute(
        "select allergens_recorded_at from public.food_items where id=%s", (food["id"],)
    ).fetchone()[0]
    assert clock.year == 2026
    count = c.execute(
        "select count(*) from private.listing_statement_events where entity_id=%s", (food["id"],)
    ).fetchone()[0]
    assert save("food", update, key=key).status_code == 200
    assert (
        c.execute(
            "select count(*) from private.listing_statement_events where entity_id=%s",
            (food["id"],),
        ).fetchone()[0]
        == count
    )
    assert save("food", {**update, "name": "Changed request"}, key=key).status_code == 409


def test_unknown_reset_old_client_preservation_and_reconfirmation(listing):
    c, _, _, _, stall, food, save = listing
    old_stall = {k: v for k, v in stall.items() if k not in ["description", "declarations"]}
    assert save("stall", {**old_stall, "specialty": "Noodles"}).status_code == 200
    assert c.execute(
        "select description,declarations from public.stalls where id=%s", (stall["id"],)
    ).fetchone() == (stall["description"], stall["declarations"])
    old_food = {k: v for k, v in food.items() if k != "allergens"}
    assert save("food", {**old_food, "ingredients": ["rice", "soy"]}).status_code == 200
    statement, at = c.execute(
        "select allergens,allergens_recorded_at from public.food_items where id=%s", (food["id"],)
    ).fetchone()
    assert statement["status"] == "unknown" and statement["contains"] == [] and at is None
    assert (
        save(
            "food",
            {
                **old_food,
                "ingredients": ["rice", "eggs"],
                "allergens": {
                    "status": "confirmed",
                    "contains": ["eggs"],
                    "cross_contact": "unknown",
                },
            },
        ).status_code
        == 200
    )
    assert (
        c.execute(
            "select allergens->>'status' from public.food_items where id=%s", (food["id"],)
        ).fetchone()[0]
        == "confirmed"
    )
    # An operator/voice SQL update cannot retain old confirmation through ingredient changes.
    c.execute(
        "update public.food_items set ingredients=array['rice','wheat'] where id=%s", (food["id"],)
    )
    assert (
        c.execute(
            "select allergens->>'status' from public.food_items where id=%s", (food["id"],)
        ).fetchone()[0]
        == "unknown"
    )


def test_direct_rpc_validation_and_public_writes_denied(listing):
    _, api, direct, sessions, stall, food, save = listing
    assert save("stall", {**stall, "description": "x" * 1001}).status_code == 422
    assert (
        save(
            "food",
            {
                **food,
                "allergens": {
                    "status": "unknown",
                    "contains": ["milk"],
                    "cross_contact": "unknown",
                },
            },
        ).status_code
        == 422
    )
    for kind, value in [
        (
            "stall",
            {
                **stall,
                "declarations": {
                    "pork_free": "yes",
                    "alcohol_free": "yes",
                    "muslim_owned": "yes",
                    "inferred_ethnicity": "fake",
                },
            },
        ),
        (
            "food",
            {
                **food,
                "allergens": {
                    "status": "confirmed",
                    "contains": ["milk", "milk"],
                    "cross_contact": "unknown",
                },
            },
        ),
    ]:
        response = direct.post(
            "/rest/v1/rpc/vendor_command",
            headers=sessions["vendor-a"],
            json={"p_kind": kind, "p_data": value, "p_request_id": str(uuid4())},
        )
        assert response.status_code == 400
    assert (
        direct.patch(
            f"/rest/v1/stalls?id=eq.{stall['id']}", json={"description": "Anonymous overwrite"}
        ).status_code
        >= 400
    )
    assert (
        direct.patch(
            f"/rest/v1/food_items?id=eq.{food['id']}",
            headers=sessions["vendor-a"],
            json={"allergens": food["allergens"]},
        ).status_code
        >= 400
    )
    assert (
        api.post(
            "/api/v1/me/onboard",
            headers=sessions["vendor-a"],
            json={
                "display_name": "Fictional",
                "locale": "en",
                "accepted": True,
                "roles": ["admin"],
            },
        ).status_code
        == 422
    )


def test_verified_customer_bootstrap_ignores_metadata_privileges(connected):
    c, _, _, _ = connected
    user = uuid4()
    # Transaction rolls back a minimal synthetic Auth row; no email, invite or public signup.
    with c.transaction(force_rollback=True):
        c.execute(
            "insert into auth.users(id,email,raw_user_meta_data) values(%s,%s,%s::jsonb)",
            (
                user,
                f"cp1-{user}@pasarmalam.invalid",
                json.dumps({"role": "admin", "roles": ["vendor"], "mode": "hawker"}),
            ),
        )

        def actor():
            c.execute("set local role authenticated")
            c.execute(
                "select set_config('request.jwt.claims',%s,true)",
                (json.dumps({"sub": str(user), "role": "authenticated"}),),
            )

        actor()
        with pytest.raises(psycopg.Error) as failure:
            with c.transaction():
                c.execute("select public.onboard_customer('Fictional customer','ms')")
        assert failure.value.sqlstate == "42501"
        c.execute("reset role")
        c.execute("update auth.users set email_confirmed_at=now() where id=%s", (user,))
        actor()
        with pytest.raises(psycopg.Error) as no_invite:
            with c.transaction():
                c.execute("select public.onboard_customer('Fictional customer','ms')")
        assert no_invite.value.sqlstate == "42501"
        c.execute("reset role")
        c.execute("update auth.users set invited_at=now() where id=%s", (user,))
        actor()
        assert (
            c.execute("select public.onboard_customer('Fictional customer','ms')").fetchone()[0]
            == user
        )
        assert c.execute(
            "select role from public.user_roles where user_id=%s", (user,)
        ).fetchall() == [("customer",)]
        with pytest.raises(psycopg.Error) as denied:
            with c.transaction():
                c.execute(
                    "insert into public.user_roles(user_id,role) values(%s,'vendor')", (user,)
                )
        assert denied.value.sqlstate == "42501"
        assert c.execute("select public.vendor_workspace()").fetchone()[0] is None
