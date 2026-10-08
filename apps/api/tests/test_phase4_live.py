"""Run against the guarded disposable database; no mocked SQL/Storage acceptance."""

import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from io import BytesIO
from uuid import uuid4

import psycopg
import pytest
from demo_db import target_configuration, verify_marker
from demo_seed import stable
from PIL import Image
from test_live_permissions import headers
from test_live_permissions import live as live

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_PHASE4") != "1",
        reason="Phase 4 disposable Supabase not configured",
    ),
]


def send(api, sessions, kind, data, request=None, persona="vendor-a"):
    return api.post(
        "/api/v1/vendor/command",
        headers=headers(sessions, persona),
        json={
            "kind": kind,
            "data": data,
            "request_id": request or str(uuid4()),
        },
    )


def new_batch():
    return {
        "food_item_id": str(stable("food-a")),
        "prepared_at": (datetime.now(timezone.utc) - timedelta(minutes=20)).isoformat(),
        "quantity": 10,
        "handling": {"storage": "ambient", "note": "Fictional"},
        "photo": None,
    }


def test_live_stall_edit_roundtrip_and_retry(live):
    _, api, _, sessions = live
    workspace = api.get(
        "/api/v1/vendor/workspace", headers=headers(sessions, "vendor-a")
    ).json()
    original = next(s for s in workspace["stalls"] if s["id"] == str(stable("stall-a")))
    edited = {**original, "specialty": "Fictional edit acceptance"}
    request = str(uuid4())
    try:
        first = send(api, sessions, "stall", edited, request)
        assert first.status_code == 200
        assert send(api, sessions, "stall", edited, request).json() == first.json()
        current = api.get(
            "/api/v1/vendor/workspace", headers=headers(sessions, "vendor-a")
        ).json()
        assert next(s for s in current["stalls"] if s["id"] == original["id"]) == edited
        assert send(api, sessions, "stall", edited, persona="vendor-b").status_code == 403
    finally:
        assert send(api, sessions, "stall", original).status_code == 200


def test_live_earlier_correction_and_earliest_deadline(live):
    _, api, _, sessions = live
    data = new_batch()
    ids = [send(api, sessions, "batch", data).json()["id"] for _ in range(2)]
    earliest = datetime.now(timezone.utc) + timedelta(minutes=30)
    _, _, database = target_configuration()
    # Synthetic policy setup is an operator action on the guarded test project only.
    with psycopg.connect(database) as connection:
        verify_marker(connection)
        policy = connection.execute(
            "insert into public.handling_policies(version,rules) values(%s,'{}') returning id",
            (f"phase4-test-{uuid4()}",),
        ).fetchone()[0]
        for index, batch_id in enumerate(ids):
            connection.execute(
                "update public.batches set status='active',policy_id=%s,advisory_deadline=%s "
                "where id=%s",
                (policy, earliest + timedelta(minutes=index * 15), batch_id),
            )
    earlier_preparation = datetime.fromisoformat(data["prepared_at"]) - timedelta(minutes=10)
    correction = send(
        api,
        sessions,
        "action",
        {
            "batch_id": ids[0],
            "action": "correct",
            "prepared_at": earlier_preparation.isoformat(),
        },
    )
    assert correction.status_code == 200
    merged = send(api, sessions, "merge", {"source_ids": ids})
    assert merged.status_code == 200
    state = api.get("/api/v1/vendor/workspace", headers=headers(sessions, "vendor-a")).json()
    source = next(b for b in state["batches"] if b["id"] == ids[0])
    result = next(b for b in state["batches"] if b["id"] == merged.json()["id"])
    assert datetime.fromisoformat(source["prepared_at"]) == datetime.fromisoformat(
        data["prepared_at"]
    )
    assert datetime.fromisoformat(result["prepared_at"]) == earlier_preparation
    assert datetime.fromisoformat(result["advisory_deadline"]) == earliest - timedelta(minutes=10)
    assert result["remaining_quantity"] == 20 and result["status"] == "needs-information"


def test_live_retry_ownership_concurrent_sequence_and_stock(live):
    direct, api, _, sessions = live
    data = new_batch()
    key = str(uuid4())
    first = send(api, sessions, "batch", data, key)
    assert first.status_code == 200
    assert send(api, sessions, "batch", data, key).json() == first.json()
    assert send(api, sessions, "batch", {**data, "quantity": 11}, key).status_code == 409
    assert send(api, sessions, "batch", data, persona="vendor-b").status_code == 403
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda _: send(api, sessions, "batch", new_batch()), range(4)))
    assert all(r.status_code == 200 for r in results)
    ids = [r.json()["id"] for r in results] + [first.json()["id"]]
    rows = direct.get(
        "/rest/v1/batches",
        params={
            "id": "in.(" + ",".join(ids) + ")",
            "select": "id,batch_number,prepared_at,uploaded_at",
        },
        headers=headers(sessions, "vendor-a"),
    ).json()
    assert len(rows) == len(ids)
    assert len({r["batch_number"] for r in rows}) == len(ids)
    sale = {"batch_id": ids[0], "action": "consume", "quantity": 7}
    with ThreadPoolExecutor(max_workers=2) as pool:
        outcomes = list(pool.map(lambda _: send(api, sessions, "action", sale), range(2)))
    assert sorted(r.status_code for r in outcomes) == [200, 422]
    assert (
        send(api, sessions, "action", {"batch_id": ids[0], "action": "sold-out"}).status_code == 200
    )
    unchanged = api.get("/api/v1/vendor/workspace", headers=headers(sessions, "vendor-a")).json()
    assert next(b for b in unchanged["batches"] if b["id"] == ids[1])["remaining_quantity"] == 10


def test_live_merge_correction_and_direct_immutability(live):
    direct, api, _, sessions = live
    data = new_batch()
    first = send(api, sessions, "batch", data).json()["id"]
    second = send(api, sessions, "batch", {**data, "quantity": None}).json()["id"]
    later = datetime.now(timezone.utc).isoformat()
    assert (
        send(
            api,
            sessions,
            "action",
            {
                "batch_id": first,
                "action": "correct",
                "prepared_at": later,
            },
        ).status_code
        == 422
    )
    assert (
        direct.patch(
            f"/rest/v1/batches?id=eq.{first}",
            headers=headers(sessions, "vendor-a"),
            json={"prepared_at": later},
        ).status_code
        >= 400
    )
    merged = send(api, sessions, "merge", {"source_ids": [first, second]})
    assert merged.status_code == 200
    state = api.get("/api/v1/vendor/workspace", headers=headers(sessions, "vendor-a")).json()
    batch = next(b for b in state["batches"] if b["id"] == merged.json()["id"])
    assert batch["remaining_quantity"] is None and batch["advisory_deadline"] is None
    assert batch["status"] == "needs-information"
    assert all(b["status"] == "merged" for b in state["batches"] if b["id"] in [first, second])


def test_live_decoded_upload_scoping_cleanup_and_original_photo(live):
    direct, api, _, sessions = live
    image = Image.new("RGB", (100, 100), "green")
    output = BytesIO()
    exif = Image.Exif()
    exif[270] = "private metadata"
    image.save(output, "JPEG", exif=exif)
    endpoint = f"/api/v1/vendor/photos/{stable('stall-a')}"
    auth = headers(sessions, "vendor-a")
    assert api.post(endpoint, headers=auth, content=b"fake").status_code == 422
    assert api.post(endpoint, headers=auth, content=b"x" * 5242881).status_code == 413
    assert (
        api.post(
            endpoint, headers=headers(sessions, "vendor-b"), content=output.getvalue()
        ).status_code
        == 403
    )
    raw_key = f"{stable('stall-a')}/{uuid4()}/{uuid4()}.jpg"
    assert (
        direct.post(
            f"/storage/v1/object/listing-media/{raw_key}",
            headers={**auth, "Content-Type": "image/jpeg"},
            content=output.getvalue(),
        ).status_code
        >= 400
    )
    uploaded = api.post(endpoint, headers=auth, content=output.getvalue())
    assert uploaded.status_code == 200
    key = uploaded.json()["key"]
    public = direct.get(f"/storage/v1/object/public/listing-media/{key}")
    assert public.status_code == 200
    with Image.open(BytesIO(public.content)) as photo:
        assert not photo.getexif()
    assert send(api, sessions, "batch", {**new_batch(), "photo": key}).status_code == 200
    assert (
        api.post("/api/v1/vendor/photos/cleanup", headers=auth, json={"key": key}).status_code
        >= 400
    )
    orphan = api.post(endpoint, headers=auth, content=output.getvalue()).json()["key"]
    assert (
        api.post("/api/v1/vendor/photos/cleanup", headers=auth, json={"key": orphan}).status_code
        == 200
    )
