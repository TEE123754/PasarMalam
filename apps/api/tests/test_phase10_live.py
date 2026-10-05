"""Guarded Phase 10 database checks; no actual push network call."""

import os
from uuid import uuid4

import psycopg
import pytest
from demo_db import target_configuration, verify_marker
from test_live_permissions import live as live
from test_phase9_live import actor

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_PHASE10") != "1", reason="Phase 10 disposable project not configured"
    ),
]


@pytest.fixture
def database(live):
    _, _, identities, _ = live
    _, _, url = target_configuration()
    with psycopg.connect(url) as c:
        verify_marker(c)
        yield c, identities
        c.rollback()


def test_subscription_credentials_not_browser_readable(database):
    c, ids = database
    actor(c, ids["customer-a"])
    for table in [
        "public.push_subscriptions",
        "private.test_push_subscriptions",
        "private.test_push_attempts",
    ]:
        with pytest.raises(psycopg.errors.InsufficientPrivilege), c.transaction():
            c.execute(f"select * from {table}")


def test_endpoint_allowlist_and_own_revocation(database):
    c, ids = database
    actor(c, ids["customer-a"])
    with pytest.raises(psycopg.errors.InvalidParameterValue), c.transaction():
        c.execute(
            "select public.push_enrol(%s,%s,%s)", ("https://localhost/push", "A" * 87, "B" * 22)
        )
    endpoint = "https://fcm.googleapis.com/send/DEMO-" + str(uuid4())
    assert c.execute(
        "select public.push_enrol(%s,%s,%s)", (endpoint, "A" * 87, "B" * 22)
    ).fetchone()[0]["enrolled"]
    assert c.execute("select public.push_revoke()").fetchone()[0]["revoked"]
    c.execute("reset role")
    assert (
        c.execute(
            "select count(*) from private.test_push_subscriptions where owner_id=%s",
            (ids["customer-a"],),
        ).fetchone()[0]
        == 0
    )
