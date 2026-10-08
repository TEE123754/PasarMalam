import os
from uuid import uuid4

import pytest
from test_cp1_live import connected as connected
from test_cp1_live import listing as listing

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(os.getenv("RUN_LIVE_CP3") != "1", reason="CP3 explicit disposable gate"),
]


def submit(api, headers, food, **changes):
    value = {
        "action": "update_food",
        "food": food,
        "unit": "pack",
        "transcript": "Fictional reviewed command",
        "history": [],
        "confirmed": True,
        "request_id": str(uuid4()),
        **changes,
    }
    return api.post("/api/v1/voice/workflow-confirm", headers=headers, json=value)


def test_menu_confirmation_is_atomic_and_idempotent(listing):
    c, api, _, sessions, stall, food, _ = listing
    key = str(uuid4())
    value = {**food, "price_sen": 700}
    assert submit(api, sessions["vendor-a"], value, request_id=key).status_code == 200
    assert submit(api, sessions["vendor-a"], value, request_id=key).status_code == 200
    assert (
        submit(api, sessions["vendor-a"], {**value, "price_sen": 800}, request_id=key).status_code
        != 200
    )
    assert (
        c.execute("select price_sen from public.food_items where id=%s", (food["id"],)).fetchone()[
            0
        ]
        == 700
    )
    assert (
        c.execute(
            "select count(*) from public.batches where food_item_id=%s", (food["id"],)
        ).fetchone()[0]
        == 0
    )
    assert submit(api, sessions["vendor-b"], value).status_code != 200
    c.execute("delete from private.cp3_voice_requests where request_id=%s", (key,))
    c.execute("delete from public.extraction_runs where stall_id=%s", (stall["id"],))


def test_existing_stock_and_new_batch_keep_times_and_reject_stale_foreign_retry(listing):
    c, api, _, sessions, stall, food, _ = listing
    batch = {
        "food_item_id": food["id"],
        "prepared_at": "2026-10-08T08:00:00+08:00",
        "quantity": 20,
        "handling": {"storage": "ambient", "note": "Fictional test"},
        "photo": None,
    }
    # Current timestamps keep the gate repeatable on another day.
    from datetime import datetime, timezone

    batch["prepared_at"] = datetime.now(timezone.utc).isoformat()
    result = submit(api, sessions["vendor-a"], food, action="create_batch", batch=batch)
    assert result.status_code == 200
    bid = result.json()["id"]

    def row():
        return c.execute(
            "select prepared_at,advisory_deadline,remaining_quantity "
            "from public.batches where id=%s",
            (bid,),
        ).fetchone()

    original = row()
    key = str(uuid4())
    args = {
        "action": "update_stock",
        "batch_id": bid,
        "expected_remaining": 20,
        "remaining": 10,
        "request_id": key,
    }
    try:
        assert submit(api, sessions["vendor-a"], food, **args).status_code == 200
        assert submit(api, sessions["vendor-a"], food, **args).status_code == 200
        assert row() == (original[0], original[1], 10)
        assert (
            submit(
                api, sessions["vendor-a"], food, **{**args, "request_id": str(uuid4())}
            ).status_code
            != 200
        )
        assert (
            submit(
                api, sessions["vendor-b"], food, **{**args, "request_id": str(uuid4())}
            ).status_code
            != 200
        )
        assert (
            submit(
                api,
                sessions["vendor-a"],
                food,
                **{**args, "batch_id": str(uuid4()), "request_id": str(uuid4())},
            ).status_code
            != 200
        )
        d = api.get("/api/v1/discovery").json()
        public = next(b for b in d["batches"] if b["id"] == bid)
        assert public["remaining"] == 10
        assert (
            c.execute(
                "select count(*) from public.batches where food_item_id=%s", (food["id"],)
            ).fetchone()[0]
            == 1
        )
    finally:
        c.execute("delete from public.extraction_runs where stall_id=%s", (stall["id"],))
        c.execute(
            "delete from private.cp3_voice_requests where result in (%s,%s)", (bid, food["id"])
        )
        c.execute("delete from private.voice_requests where result=%s", (bid,))
        c.execute("delete from public.batch_events where batch_id=%s", (bid,))
        c.execute("delete from public.promotions where batch_id=%s", (bid,))
        # Advisory records reference the batch; remove test-only dependencies in fixture cleanup.
        c.execute("delete from public.batch_advisories where batch_id=%s", (bid,))
        c.execute("delete from public.batches where id=%s", (bid,))


@pytest.mark.parametrize("field", ["p_action", "p_unit", "p_food"])
def test_direct_rpc_rejects_null_required_fields(listing, field):
    _, _, direct, sessions, _, food, _ = listing
    payload = {
        "p_action": "update_food",
        "p_food": food,
        "p_batch": None,
        "p_batch_id": None,
        "p_expected": None,
        "p_remaining": None,
        "p_unit": "pack",
        "p_transcript": "Fictional null validation",
        "p_history": [],
        "p_request": str(uuid4()),
    }
    payload[field] = None
    response = direct.post(
        "/rest/v1/rpc/confirm_voice_workflow", headers=sessions["vendor-a"], json=payload
    )
    assert response.status_code == 400
    assert response.json()["code"] == "22023"
