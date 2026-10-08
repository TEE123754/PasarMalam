"""Phase 3 real geographic/customer boundaries; requires disposable Supabase."""

import os

import psycopg
import pytest
from demo_db import target_configuration, verify_marker
from demo_seed import stable
from test_live_permissions import headers
from test_live_permissions import live as live_fixture

live = live_fixture

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_PHASE3") != "1", reason="Phase 3 disposable Supabase not configured"
    ),
]


def test_live_geographic_rpc_and_bounds(live):
    direct, api, _, _ = live
    result = api.get("/api/v1/discovery/nearby?lat=3.107&lon=101.606&radius=2000")
    assert result.status_code == 200
    assert str(stable("market-a")) in [row["id"] for row in result.json()]
    empty = direct.post(
        "/rest/v1/rpc/nearby_markets",
        json={
            "p_lat": 3.11,
            "p_lon": 101.61,
            "p_radius": 2000,
            "p_south": 0,
            "p_north": 1,
            "p_west": 0,
            "p_east": 1,
        },
    )
    assert empty.status_code == 200 and empty.json() == []
    assert api.get("/api/v1/discovery/nearby?lat=100&lon=101").status_code == 422


def test_live_saved_stalls_are_customer_private_and_idempotent(live):
    direct, api, _, sessions = live
    customer = headers(sessions, "customer-a")
    body = {"stall_id": str(stable("stall-a")), "saved": True}
    assert api.post("/api/v1/me/favourites", json=body, headers=customer).status_code == 200
    assert api.post("/api/v1/me/favourites", json=body, headers=customer).status_code == 200
    assert api.get("/api/v1/me/favourites", headers=customer).json().count(body["stall_id"]) == 1
    for actor in ["customer-b", "vendor-a"]:
        rows = direct.get(
            "/rest/v1/favourites?select=owner_id,stall_id", headers=headers(sessions, actor)
        )
        assert rows.status_code == 200
        assert not any(
            row["owner_id"] == sessions["customer-a"]["user"]["id"] for row in rows.json()
        )
    assert (
        direct.post(
            "/rest/v1/favourites",
            json={"owner_id": sessions["customer-a"]["user"]["id"], "stall_id": body["stall_id"]},
            headers=customer,
        ).status_code
        >= 400
    )
    assert (
        api.post(
            "/api/v1/me/favourites", json={**body, "saved": False}, headers=customer
        ).status_code
        == 200
    )


def test_live_checkin_and_public_version_projection(live):
    direct, api, _, sessions = live
    customer = headers(sessions, "customer-b")
    market = str(stable("market-a"))
    before = direct.get(f"/rest/v1/discovery_versions?market_id=eq.{market}&select=*").json()[0]
    first = api.post("/api/v1/me/check-ins", json={"market_id": market}, headers=customer)
    second = api.post("/api/v1/me/check-ins", json={"market_id": market}, headers=customer)
    assert first.status_code == second.status_code == 200
    assert second.json() == {"created": False}
    after = direct.get(f"/rest/v1/discovery_versions?market_id=eq.{market}&select=*").json()[0]
    assert set(after) == {"market_id", "version", "updated_at"}
    assert after["version"] >= before["version"]
    assert (
        api.post(
            "/api/v1/me/check-ins",
            json={"market_id": market},
            headers=headers(sessions, "vendor-a"),
        ).status_code
        == 403
    )


def test_noop_advisory_refresh_does_not_publish_realtime_loop(live):
    _, _, _, _ = live
    _, _, url = target_configuration()
    with psycopg.connect(url, connect_timeout=10) as c:
        verify_marker(c)
        market = stable("market-a")

        def version():
            return c.execute(
                "select version from public.discovery_versions where market_id=%s", (market,)
            ).fetchone()[0]

        before = version()
        c.execute("update public.stalls set name=name where id=%s", (stable("stall-a"),))
        assert version() == before
        c.execute("update public.stalls set open=not open where id=%s", (stable("stall-a"),))
        assert version() > before
        c.execute("select public.refresh_discovery_advisories()")
        refreshed = version()
        c.execute("select public.refresh_discovery_advisories()")
        assert version() == refreshed
        c.rollback()
