"""Local Phase 9 API/SQL checks. Syntax is not live database acceptance."""

from pathlib import Path
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from app.contracts import Actor
from app.main import app
from app.partners import Command, action_adapter
from app.routes import Access, access
from fastapi.testclient import TestClient
from pglast import parse_plpgsql, parse_sql
from pydantic import ValidationError


@pytest.mark.parametrize(
    "change",
    [
        {"units": True},
        {"units": 1.2},
        {"units": -1},
        {"estimatedGrams": -1},
        {"route": "real-dispatch"},
        {"owner": str(uuid4())},
        {"weighedGrams": 200},
    ],
)
def test_collection_input_boundaries(change):
    with pytest.raises(ValidationError):
        action_adapter.validate_python(
            {
                "kind": "collection",
                "batch": str(uuid4()),
                "org": str(uuid4()),
                "route": "donation",
                "units": 1,
                "estimatedGrams": 150,
                **change,
            }
        )


def test_consent_is_strict_and_cannot_inject_original_body():
    with pytest.raises(ValidationError):
        Command(
            action={
                "kind": "referral",
                "report": str(uuid4()),
                "org": str(uuid4()),
                "summary": "Demo approved summary",
                "consent": "true",
                "original": "secret",
            },
            request_id=uuid4(),
        )


def test_partner_auth_and_caller_rpc():
    client = TestClient(app)
    assert client.get("/api/v1/partners/workspace").status_code == 401
    repo = AsyncMock()
    repo.rpc.return_value = str(uuid4())
    app.dependency_overrides[access] = lambda: Access(
        Actor(id=uuid4(), display_name="Demo", locale="en", verified=True, roles=["vendor"]), repo
    )
    try:
        key = str(uuid4())
        action = {
            "kind": "permit",
            "stall": str(uuid4()),
            "org": str(uuid4()),
            "body": "Fictional application",
        }
        response = client.post(
            "/api/v1/partners/command", json={"action": action, "request_id": key}
        )
        assert response.status_code == 200 and response.json()["provider_mode"] == "simulated"
        repo.rpc.assert_awaited_once_with("partners_command", {"p_data": action, "p_request": key})
    finally:
        app.dependency_overrides.pop(access, None)


def test_partner_migration_syntax():
    sql = (
        Path(__file__).resolve().parents[3]
        / "supabase/migrations/20261002060812_partner_simulation.sql"
    ).read_text(encoding="utf-8-sig")
    assert parse_sql(sql) and parse_plpgsql(sql)
    assert "private.partner_links" in sql and "private.community_eligible" in sql
    assert "pg_advisory_xact_lock(824008)" in sql
    assert "private.partner_held(p_batch)" in sql
    assert "from public,anon,authenticated" in sql
