"""Real disposable SQL confirmation, scope, quota, retention and abandonment tests."""

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
        os.getenv("RUN_LIVE_PHASE6") != "1", reason="Phase 6 disposable database unavailable"
    ),
]


@pytest.fixture
def voice_database(live):
    _, _, identities, _ = live
    _, _, url = target_configuration()
    with psycopg.connect(url) as connection:
        verify_marker(connection)
        actor = identities["vendor-a"]
        connection.execute(
            "select set_config('request.jwt.claims',%s,true)",
            (json.dumps({"sub": str(actor), "role": "authenticated"}),),
        )
        connection.execute("set local role authenticated")
        yield connection, actor
        connection.rollback()


def payload():
    food = {
        "id": str(stable("food-a")),
        "stall_id": str(stable("stall-a")),
        "name": "Chicken satay",
        "price_sen": 600,
        "ingredients": ["chicken", "peanuts"],
        "photo": None,
    }
    batch = {
        "food_item_id": food["id"],
        "prepared_at": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat(),
        "quantity": 20,
        "handling": {"storage": "ambient", "note": "Synthetic voice gate"},
        "photo": None,
    }
    return food, batch


def confirm(connection, food, batch, request):
    return connection.execute(
        "select public.confirm_voice_listing(%s::jsonb,%s::jsonb,'Synthetic listing',%s)",
        (json.dumps(food), json.dumps(batch), request),
    ).fetchone()[0]


def test_live_atomic_confirmation_retry_and_conflict(voice_database):
    connection, actor = voice_database
    food, batch = payload()
    request = uuid4()
    result = confirm(connection, food, batch, request)
    assert confirm(connection, food, batch, request) == result
    assert (
        connection.execute(
            "select count(*) from public.extraction_runs where owner_id=%s "
            "and extracted->>'batch_id'=%s",
            (actor, str(result)),
        ).fetchone()[0]
        == 1
    )
    assert (
        connection.execute(
            "select remaining_quantity from public.batches where id=%s", (result,)
        ).fetchone()[0]
        == 20
    )
    with pytest.raises(psycopg.errors.UniqueViolation):
        with connection.transaction():
            confirm(connection, {**food, "price_sen": 700}, batch, request)


def test_live_foreign_stall_rejected_without_partial_menu_update(voice_database):
    connection, _ = voice_database
    food, batch = payload()
    food["stall_id"] = str(stable("stall-b"))
    with pytest.raises(psycopg.Error):
        with connection.transaction():
            confirm(connection, food, batch, uuid4())
    assert connection.execute(
        "select stall_id from public.food_items where id=%s", (stable("food-a"),)
    ).fetchone()[0] == stable("stall-a")


def test_live_quota_and_transcript_retention(voice_database):
    connection, actor = voice_database
    for _ in range(20):
        connection.execute("select public.reserve_voice_attempt()")
    with pytest.raises(psycopg.Error):
        with connection.transaction():
            connection.execute("select public.reserve_voice_attempt()")
    food, batch = payload()
    result = confirm(connection, food, batch, uuid4())
    connection.execute("reset role")
    connection.execute(
        "update public.extraction_runs set confirmed_at=now()-interval '31 days' "
        "where owner_id=%s and extracted->>'batch_id'=%s",
        (actor, str(result)),
    )
    connection.execute("select private.closing_tick()")
    assert (
        connection.execute(
            "select count(*) from public.extraction_runs where owner_id=%s "
            "and extracted->>'batch_id'=%s",
            (actor, str(result)),
        ).fetchone()[0]
        == 0
    )


def test_live_abandonment_blocks_later_attachment(voice_database):
    connection, actor = voice_database
    key = f"{stable('stall-a')}/{actor}/{uuid4()}.jpg"
    connection.execute("reset role")
    connection.execute(
        "insert into private.listing_uploads(object_key,actor_id,stall_id,ready) "
        "values(%s,%s,%s,true)",
        (key, actor, stable("stall-a")),
    )
    connection.execute("set local role authenticated")
    connection.execute("select public.check_listing_cleanup(%s)", (key,))
    connection.execute("reset role")
    assert connection.execute(
        "select abandoned_at is not null from private.listing_uploads where object_key=%s", (key,)
    ).fetchone()[0]
    with pytest.raises(psycopg.errors.InsufficientPrivilege):
        with connection.transaction():
            connection.execute(
                "select private.attach_listing_photo(%s,%s)", (key, stable("stall-a"))
            )
