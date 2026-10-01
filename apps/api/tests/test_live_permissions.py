"""Real REST/API/Storage checks. Never replace an unavailable live gate with mocks."""

import base64
import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import httpx
import psycopg
import pytest
from app.main import app
from app.settings import get_settings
from demo_db import target_configuration, verify_marker
from demo_seed import PERSONAS, seed, stable
from fastapi.testclient import TestClient

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_PHASE2") != "1",
        reason="Disposable Supabase live gate not configured",
    ),
]


@pytest.fixture(scope="module")
def live():
    _, url, database = target_configuration()
    with psycopg.connect(database) as connection:
        verify_marker(connection)
    identities = seed()
    tables = ["profiles", "markets", "stalls", "food_items", "reviews", "organisations"]
    with psycopg.connect(database) as connection:
        before = {
            table: connection.execute(f"select count(*) from public.{table}").fetchone()[0]
            for table in tables
        }
    assert seed() == identities
    with psycopg.connect(database) as connection:
        after = {
            table: connection.execute(f"select count(*) from public.{table}").fetchone()[0]
            for table in tables
        }
    assert before == after
    assert before == {
        "profiles": 5,
        "markets": 2,
        "stalls": 2,
        "food_items": 3,
        "reviews": 2,
        "organisations": 2,
    }
    settings = get_settings()
    client = httpx.Client(base_url=url, headers={"apikey": settings.publishable_key}, timeout=15)
    sessions = {}
    for persona in PERSONAS:
        response = client.post(
            "/auth/v1/token?grant_type=password",
            json={
                "email": f"{persona}@pasarmalam.invalid",
                "password": os.environ["DEMO_SEED_PASSWORD"],
            },
        )
        assert response.status_code == 200, "Synthetic account sign-in failed"
        sessions[persona] = response.json()
    yield client, TestClient(app), identities, sessions
    client.close()


def headers(sessions, persona):
    return {"Authorization": f"Bearer {sessions[persona]['access_token']}"}


def test_live_visitor_and_safe_projection(live):
    direct, api, _, _ = live
    assert api.get("/api/v1/discovery").status_code == 200
    assert api.get("/api/v1/me").status_code == 401
    assert direct.post("/rest/v1/stalls", json={"name": "Visitor write"}).status_code >= 400
    assert direct.get("/rest/v1/profiles?select=*").status_code >= 400
    assert direct.get("/rest/v1/reviews?select=customer_id").status_code >= 400
    public = direct.get("/rest/v1/public_reviews?select=*")
    assert public.status_code == 200
    assert all("customer_id" not in row and "evidence_keys" not in row for row in public.json())


def test_live_vendor_ownership_and_atomic_retry(live):
    direct, api, _, sessions = live
    auth = headers(sessions, "vendor-a")
    body = {
        "food_item_id": str(stable("food-b")),
        "prepared_at": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat(),
        "quantity": 5,
        "handling": {},
        "request_id": str(uuid4()),
    }
    assert api.post("/api/v1/batches", headers=auth, json=body).status_code == 403
    assert (
        direct.post(
            "/rest/v1/rpc/create_batch",
            headers=auth,
            json={
                "p_food_item_id": body["food_item_id"],
                "p_prepared_at": body["prepared_at"],
                "p_quantity": 5,
                "p_handling": {},
                "p_request_id": body["request_id"],
            },
        ).status_code
        >= 400
    )
    body["food_item_id"] = str(stable("food-a"))
    first = api.post("/api/v1/batches", headers=auth, json=body)
    assert first.status_code == 200
    assert api.post("/api/v1/batches", headers=auth, json=body).json() == first.json()
    batch_id = first.json()["id"]
    assert (
        direct.patch(
            f"/rest/v1/batches?id=eq.{batch_id}", headers=auth, json={"remaining_quantity": 99}
        ).status_code
        >= 400
    )
    assert (
        direct.get(
            f"/rest/v1/batches?id=eq.{batch_id}&select=id", headers=headers(sessions, "vendor-b")
        ).json()
        == []
    )
    inventory = {"delta": -1, "request_id": str(uuid4())}
    endpoint = f"/api/v1/batches/{batch_id}/inventory"
    assert api.post(endpoint, headers=auth, json=inventory).json() == {"remaining_quantity": 4}
    assert api.post(endpoint, headers=auth, json=inventory).json() == {"remaining_quantity": 4}
    assert api.post(endpoint, headers=auth, json={**inventory, "delta": -2}).status_code == 409
    assert (
        api.post(
            f"/api/v1/batches/{batch_id}/promotions",
            headers=auth,
            json={
                "title": "Must reject unknown handling",
                "price_sen": 100,
                "quantity": 1,
                "ends_at": (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat(),
                "request_id": str(uuid4()),
            },
        ).status_code
        == 422
    )


def test_live_metadata_escalation_and_org_isolation(live):
    direct, api, identities, sessions = live
    customer = headers(sessions, "customer-a")
    assert (
        direct.post(
            "/rest/v1/user_roles",
            headers=customer,
            json={"user_id": str(identities["customer-a"]), "role": "admin"},
        ).status_code
        >= 400
    )
    changed = direct.put("/auth/v1/user", headers=customer, json={"data": {"role": "admin"}})
    assert changed.status_code == 200
    refreshed = direct.post(
        "/auth/v1/token?grant_type=refresh_token",
        json={"refresh_token": sessions["customer-a"]["refresh_token"]},
    )
    assert refreshed.status_code == 200
    sessions["customer-a"] = refreshed.json()
    customer = headers(sessions, "customer-a")
    assert api.get("/api/v1/me", headers=customer).json()["roles"] == ["customer"]
    assert api.get("/api/v1/admin/summary", headers=customer).status_code == 403
    organisations = direct.get(
        "/rest/v1/organisations?select=id", headers=headers(sessions, "vendor-a")
    )
    assert organisations.status_code == 200
    assert organisations.json() == [{"id": str(stable("org-a"))}]
    assert api.get("/api/v1/admin/summary", headers=headers(sessions, "admin")).status_code == 200


def test_live_public_and_private_storage(live):
    direct, _, identities, sessions = live
    png = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB6kAAAAASUVORK5CYII="
    )
    suffix = f"phase2-{uuid4()}.png"
    evidence = f"{identities['customer-a']}/{suffix}"
    owner = headers(sessions, "customer-a")
    result = direct.post(
        f"/storage/v1/object/complaint-evidence/{evidence}",
        headers={**owner, "Content-Type": "image/png"},
        content=png,
    )
    assert result.status_code in {200, 201}
    assert direct.get(f"/storage/v1/object/public/complaint-evidence/{evidence}").status_code >= 400
    assert (
        direct.get(
            f"/storage/v1/object/authenticated/complaint-evidence/{evidence}",
            headers=headers(sessions, "customer-b"),
        ).status_code
        >= 400
    )
    assert (
        direct.get(
            f"/storage/v1/object/authenticated/complaint-evidence/{evidence}", headers=owner
        ).status_code
        == 200
    )
    assert (
        direct.get(
            f"/storage/v1/object/authenticated/complaint-evidence/{evidence}",
            headers=headers(sessions, "admin"),
        ).status_code
        == 200
    )
    listing = f"{stable('stall-a')}/{identities['vendor-a']}/{suffix}"
    assert direct.post(
        f"/storage/v1/object/listing-media/{listing}",
        headers={**headers(sessions, "vendor-a"), "Content-Type": "image/png"},
        content=png,
    ).status_code >= 400
    forbidden = f"{stable('stall-a')}/{identities['vendor-b']}/{suffix}"
    assert (
        direct.post(
            f"/storage/v1/object/listing-media/{forbidden}",
            headers={**headers(sessions, "vendor-b"), "Content-Type": "image/png"},
            content=png,
        ).status_code
        >= 400
    )
    assert direct.get(f"/storage/v1/object/public/listing-media/{listing}").status_code == 200


def test_live_report_rate_limits_and_privacy(live):
    direct, api, _, sessions = live
    auth = headers(sessions, "customer-b")
    created = []
    for _ in range(3):
        report = api.post(
            "/api/v1/complaints",
            headers=auth,
            json={
                "stall_id": str(stable("stall-a")),
                "body": "Fictional hygiene training report only.",
                "evidence_keys": [],
                "request_id": str(uuid4()),
            },
        )
        assert report.status_code == 200
        created.append(report.json()["id"])
    assert (
        api.post(
            "/api/v1/complaints",
            headers=auth,
            json={
                "stall_id": str(stable("stall-a")),
                "body": "Fourth synthetic report must be limited.",
                "evidence_keys": [],
                "request_id": str(uuid4()),
            },
        ).status_code
        == 429
    )
    assert (
        direct.get("/rest/v1/complaints?select=id", headers=headers(sessions, "vendor-a")).json()
        == []
    )
    assert direct.get("/rest/v1/complaints?select=id").status_code >= 400
    assert (
        api.post(
            f"/api/v1/complaints/{created[0]}/moderation",
            headers=headers(sessions, "vendor-a"),
            json={"status": "triaged", "request_id": str(uuid4())},
        ).status_code
        == 403
    )
