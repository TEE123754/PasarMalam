import json
import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import psycopg
import pytest
from test_cp1_live import connected as connected
from test_cp1_live import listing as listing

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(os.getenv("RUN_LIVE_CP4") != "1", reason="CP4 explicit disposable gate"),
]


def test_records_passport_privacy_retry_and_transition_gate(listing):
    c, api, _, sessions, stall, food, save = listing
    prepared = datetime.now(timezone.utc) - timedelta(minutes=2)
    bid = save(
        "batch",
        {
            "food_item_id": food["id"],
            "prepared_at": prepared.isoformat(),
            "quantity": 20,
            "handling": {"storage": "ambient", "note": "Fictional"},
            "photo": None,
        },
    ).json()["id"]
    other = None
    path = f"/api/v1/passports/{bid}"
    try:
        assert (
            api.post(
                "/api/v1/freshness/confirm",
                headers=sessions["vendor-a"],
                json={
                    "batch": bid,
                    "ingredients": ["rice"],
                    "confirmed": True,
                    "ambient": True,
                    "request_id": str(uuid4()),
                },
            ).status_code
            == 200
        )
        original = c.execute(
            "select prepared_at,advisory_deadline from public.batches where id=%s", (bid,)
        ).fetchone()
        data = {
            "kind": "temperature",
            "effective_at": prepared.isoformat(),
            "value": 158,
            "unit": "F",
            "method": "Fictional probe",
            "note": "Private fictional note",
        }
        body = {"data": data, "request_id": str(uuid4())}
        first = api.post(path + "/records", headers=sessions["vendor-a"], json=body)
        assert first.status_code == 200
        assert (
            api.post(path + "/records", headers=sessions["vendor-a"], json=body).json()
            == first.json()
        )
        assert (
            api.post(
                path + "/records",
                headers=sessions["vendor-a"],
                json={**body, "data": {**data, "value": 157}},
            ).status_code
            == 409
        )
        assert (
            api.post(path + "/records", headers=sessions["vendor-b"], json=body).status_code == 403
        )
        assert api.get(path + "/history", headers=sessions["vendor-b"]).status_code == 403
        history = api.get(path + "/history", headers=sessions["vendor-a"]).json()
        assert len(history) == 1 and history[0]["data"]["value"] == 158
        public = api.get(path)
        assert public.status_code == 200 and public.headers["cache-control"] == "no-store"
        assert public.json()["temperature_record_count"] == 1
        assert "Private fictional note" not in public.text and "Fictional probe" not in public.text
        assert "actor" not in public.json() and public.json()["cumulative_exposure"] is None
        for at in [prepared - timedelta(seconds=1), datetime.now(timezone.utc) + timedelta(days=1)]:
            assert (
                api.post(
                    path + "/records",
                    headers=sessions["vendor-a"],
                    json={
                        "data": {**data, "effective_at": at.isoformat()},
                        "request_id": str(uuid4()),
                    },
                ).status_code
                == 422
            )
        corrected = api.post(
            path + "/records",
            headers=sessions["vendor-a"],
            json={
                "data": {
                    **data,
                    "value": 157,
                    "supersedes": first.json()["id"],
                    "note": "Probe correction",
                },
                "request_id": str(uuid4()),
            },
        )
        assert corrected.status_code == 200
        for storage in ["hot-held", "ambient"]:
            assert (
                api.post(
                    path + "/records",
                    headers=sessions["vendor-a"],
                    json={
                        "data": {
                            "kind": "storage",
                            "effective_at": datetime.now(timezone.utc).isoformat(),
                            "storage": storage,
                        },
                        "request_id": str(uuid4()),
                    },
                ).status_code
                == 200
            )
        assert (
            api.post(
                "/api/v1/freshness/confirm",
                headers=sessions["vendor-a"],
                json={
                    "batch": bid,
                    "ingredients": ["rice"],
                    "confirmed": True,
                    "ambient": True,
                    "request_id": str(uuid4()),
                },
            ).status_code
            == 200
        )
        current = c.execute(
            "select prepared_at,advisory_deadline from public.batches where id=%s", (bid,)
        ).fetchone()
        assert current[0] == original[0] and current[1] <= original[1]
        passport = api.get(path).json()
        assert passport["status"] == "needs-information" and not passport["eligible"]
        assert passport["storage_review_required"] and passport["handling_record_count"] == 4
        assert not any(b["id"] == bid for b in api.get("/api/v1/discovery").json()["batches"])
        assert (
            api.post(
                "/api/v1/freshness/publish",
                headers=sessions["vendor-a"],
                json={
                    "batch": bid,
                    "kind": "fixed",
                    "value": 100,
                    "units": 1,
                    "title": "Fictional",
                    "request_id": str(uuid4()),
                },
            ).status_code
            != 200
        )
        other = save(
            "batch",
            {
                "food_item_id": food["id"],
                "prepared_at": prepared.isoformat(),
                "quantity": 10,
                "handling": {"storage": "ambient", "note": "Fictional"},
                "photo": None,
            },
        ).json()["id"]
        assert save("merge", {"source_ids": [bid, other]}).status_code == 422
        actor = str(
            c.execute(
                "select user_id from public.stall_memberships where stall_id=%s limit 1",
                (stall["id"],),
            ).fetchone()[0]
        )

        def old_command(kind, payload):
            with c.transaction():
                c.execute("select set_config('request.jwt.claim.sub',%s,true)", (actor,))
                c.execute(
                    "select private.cp4_vendor_command(%s,%s::jsonb,%s)",
                    (kind, json.dumps(payload), uuid4()),
                )

        with pytest.raises(psycopg.errors.InvalidParameterValue):
            old_command("merge", {"source_ids": [bid, other]})
        assert save("action", {"batch_id": bid, "action": "withdrawn"}).status_code == 200
        assert save("action", {"batch_id": bid, "action": "available"}).status_code == 422
        with pytest.raises(psycopg.errors.InvalidParameterValue):
            old_command("action", {"batch_id": bid, "action": "available"})
        assert api.get(path).json()["status"] == "withdrawn"
        c.execute(
            "update public.batches set inventory_state='available',"
            "status='needs-information' where id=%s",
            (bid,),
        )
        c.execute(
            "update public.batches set advisory_deadline=now()-interval '1 minute' where id=%s",
            (bid,),
        )
        assert api.get(path).json()["status"] == "expired"
        c.execute("update public.food_items set published=false where id=%s", (food["id"],))
        assert api.get(path).status_code == 404
        assert api.get(f"/api/v1/passports/{uuid4()}").status_code == 404
    finally:
        if other:
            c.execute("delete from public.batch_events where batch_id=%s", (other,))
            c.execute("delete from public.batch_advisories where batch_id=%s", (other,))
            c.execute("delete from public.batches where id=%s", (other,))
        c.execute("delete from public.batch_events where batch_id=%s", (bid,))
        c.execute("delete from public.promotions where batch_id=%s", (bid,))
        c.execute("delete from public.batch_advisories where batch_id=%s", (bid,))
        c.execute("delete from public.batches where id=%s", (bid,))
