"""Real transactional SQL checks. Skipped until a disposable Supabase is configured."""

import json
import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import psycopg
import pytest
from demo_db import target_configuration, verify_marker
from demo_seed import stable
from test_live_permissions import live as live

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_PHASE5") != "1", reason="Phase 5 live environment unavailable"
    ),
]


@pytest.fixture
def database(live):
    _, _, identities, _ = live
    _, _, url = target_configuration()
    with psycopg.connect(url) as connection:
        verify_marker(connection)
        connection.execute(
            "insert into private.agent_config(singleton,secret) values(true,%s) "
            "on conflict(singleton) do update set clock_override=null",
            ("x" * 32,),
        )
        now = datetime.now(timezone.utc)
        connection.execute(
            "insert into public.weather_snapshots(market_id,temperature_c,"
            "humidity_pct,observed_at,provider) values(%s,28,75,%s,'fixture')",
            (stable("market-a"), now),
        )
        batch = connection.execute(
            "insert into public.batches(food_item_id,batch_number,"
            "prepared_at,original_quantity,remaining_quantity,handling) "
            "select %s,coalesce(max(batch_number),0)+1,%s,10,10,"
            '\'{"storage":"ambient"}\' from public.batches '
            "where food_item_id=%s returning id",
            (stable("food-a"), now - timedelta(minutes=35), stable("food-a")),
        ).fetchone()[0]
        connection.execute(
            "select set_config('request.jwt.claims',%s,true)",
            (json.dumps({"sub": str(identities["vendor-a"]), "role": "authenticated"}),),
        )
        connection.execute("set local role authenticated")
        connection.execute(
            "select public.confirm_advisory(%s,array['chicken'],true,true,%s)", (batch, uuid4())
        )
        yield connection, batch, now
        connection.rollback()


def test_live_monotonic_window_and_exact_cutoff(database):
    connection, batch, now = database
    original = connection.execute(
        "select advisory_deadline from public.batches where id=%s", (batch,)
    ).fetchone()[0]
    assert abs((original - now).total_seconds() - 1500) < 2
    connection.execute("reset role")
    connection.execute("update private.agent_config set clock_override=%s", (original,))
    connection.execute("select private.closing_tick()")
    assert (
        connection.execute("select status from public.batches where id=%s", (batch,)).fetchone()[0]
        == "expired"
    )
    assert (
        connection.execute(
            "select count(*) from public.public_batches where id=%s", (batch,)
        ).fetchone()[0]
        == 0
    )
    connection.execute("update private.agent_config set clock_override=null")
    connection.execute("select private.closing_tick()")
    assert (
        connection.execute(
            "select advisory_deadline from public.batches where id=%s", (batch,)
        ).fetchone()[0]
        == original
    )


def test_live_alert_and_draft_deduplication(database):
    connection, batch, _ = database
    connection.execute("select public.fresh_workspace()")
    connection.execute("select public.fresh_workspace()")
    assert (
        connection.execute(
            "select count(*) from public.clearance_drafts where batch_id=%s", (batch,)
        ).fetchone()[0]
        == 1
    )
    assert (
        connection.execute(
            "select count(*) from public.alerts where batch_id=%s and current", (batch,)
        ).fetchone()[0]
        == 1
    )
    assert (
        connection.execute(
            "select count(*) from public.promotions where batch_id=%s", (batch,)
        ).fetchone()[0]
        == 0
    )


def test_live_legacy_rpc_cannot_bypass_confirmation(database):
    connection, batch, now = database
    with pytest.raises(psycopg.errors.InvalidParameterValue):
        with connection.transaction():
            connection.execute(
                "select public.create_promotion(%s,'Bypass',100,2,%s,%s)",
                (batch, now + timedelta(minutes=5), uuid4()),
            )
