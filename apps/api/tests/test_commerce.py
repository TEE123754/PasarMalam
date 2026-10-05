"""Phase 8 API validation and migration syntax; SQL execution belongs to the live gate."""

from pathlib import Path
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from app.commerce import Command, action_adapter
from app.contracts import Actor
from app.main import app
from app.routes import Access, access
from fastapi.testclient import TestClient
from pglast import parse_plpgsql, parse_sql
from pydantic import ValidationError


@pytest.mark.parametrize(
    "action",
    [
        {
            "kind": "reserve",
            "offer": str(uuid4()),
            "quantity": 1.5,
            "fulfilment": "pickup",
            "payment": "stall",
            "eta": 2,
        },
        {
            "kind": "reserve",
            "offer": str(uuid4()),
            "quantity": True,
            "fulfilment": "pickup",
            "payment": "stall",
            "eta": 2,
        },
        {"kind": "refund", "id": str(uuid4()), "amount": -1},
        {"kind": "rate", "basisPoints": 1001},
        {"kind": "delivery", "id": str(uuid4()), "action": "charge-real-card"},
        {"kind": "payment", "id": str(uuid4()), "scenario": "success", "card_number": "fake"},
        {
            "kind": "reserve",
            "offer": str(uuid4()),
            "quantity": 1,
            "fulfilment": "pickup",
            "payment": "stall",
            "eta": 61,
        },
    ],
)
def test_invalid_commercial_input(action):
    with pytest.raises(ValidationError):
        action_adapter.validate_python(action)


@pytest.mark.parametrize("path", ["workspace", "command"])
def test_private_commerce_requires_session(path):
    client = TestClient(app)
    response = (
        client.get("/api/v1/commerce/workspace")
        if path == "workspace"
        else client.post(
            "/api/v1/commerce/command",
            json={"action": {"kind": "subscription", "tier": "free"}, "request_id": str(uuid4())},
        )
    )
    assert response.status_code == 401


def test_command_forwards_only_caller_rpc_and_marks_simulated():
    repo = AsyncMock()
    repo.rpc.return_value = str(uuid4())
    member = Access(
        Actor(id=uuid4(), display_name="Fake", locale="en", verified=True, roles=["vendor"]), repo
    )
    app.dependency_overrides[access] = lambda: member
    try:
        key = str(uuid4())
        response = TestClient(app).post(
            "/api/v1/commerce/command",
            json={"action": {"kind": "subscription", "tier": "free"}, "request_id": key},
        )
        assert response.status_code == 200
        assert response.json()["provider_mode"] == "simulated"
        repo.rpc.assert_awaited_once_with(
            "commerce_command",
            {"p_data": {"kind": "subscription", "tier": "free"}, "p_request": key},
        )
    finally:
        app.dependency_overrides.pop(access, None)


def test_client_cannot_supply_actor_or_financial_result():
    with pytest.raises(ValidationError):
        Command(
            action={
                "kind": "payment",
                "id": str(uuid4()),
                "scenario": "success",
                "owner": str(uuid4()),
                "total": 1,
            },
            request_id=uuid4(),
        )


def test_commerce_sql_and_plpgsql_parse():
    sql = (
        Path(__file__).resolve().parents[3]
        / "supabase/migrations/20261002051951_commerce_simulation.sql"
    ).read_text(encoding="utf-8-sig")
    assert parse_sql(sql)
    assert parse_plpgsql(sql)
    assert "pg_advisory_xact_lock(824008)" in sql
    assert "private.commerce_stock_guard" in sql
    assert "from public,anon,authenticated" in sql
    assert "assigned_user_id=auth.uid()" in sql
