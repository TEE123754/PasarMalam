"""CP8 disposable connected ownership/read-only and consent gate."""

import os
from uuid import uuid4

import pytest
from test_cp1_live import connected as connected
from test_cp1_live import listing as listing

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(os.getenv("RUN_LIVE_CP8") != "1", reason="Explicit disposable CP8 gate"),
]


def test_owned_history_and_photo_boundaries(listing):
    c, api, _, sessions, stall, _, _ = listing
    data = {"stall": stall["id"], "target": "2026-10-15", "planned": 30}
    r = api.post("/api/v1/planning/forecast", headers=sessions["vendor-a"], json=data)
    assert r.status_code == 200, r.text
    assert r.headers["cache-control"] == "no-store"
    assert r.json()["quantity"] is None and r.json()["interval"] is None
    assert (
        api.post("/api/v1/planning/forecast", headers=sessions["vendor-b"], json=data).status_code
        == 403
    )
    assert api.post("/api/v1/planning/forecast", json=data).status_code == 401
    assert (
        api.post(
            "/api/v1/planning/forecast", headers=sessions["vendor-a"], json={**data, "planned": 1.5}
        ).status_code
        == 422
    )
    assert (
        api.post(
            "/api/v1/planning/forecast",
            headers=sessions["vendor-a"],
            json={**data, "stall": str(uuid4())},
        ).status_code
        == 403
    )
    headers = {**sessions["vendor-a"], "Content-Type": "image/png"}
    assert (
        api.post("/api/v1/planning/photo", headers=headers, content=b"not an image").status_code
        == 422
    )
    assert (
        api.post(
            "/api/v1/planning/photo",
            headers={**headers, "X-Image-Consent": "yes"},
            content=b"not an image",
        ).status_code
        == 422
    )
    assert (
        c.execute("select count(*) from public.stalls where id=%s", (stall["id"],)).fetchone()[0]
        == 1
    )
