import hashlib
import hmac
import json
from pathlib import Path

import pytest
from app.freshness import Publish
from app.main import app
from app.weather import signed_weather, weather_payload
from fastapi.testclient import TestClient
from pglast import parse_sql
from pydantic import ValidationError

ROOT = Path(__file__).resolve().parents[3]
ID = "11111111-1111-4111-8111-111111111111"


@pytest.mark.parametrize("value", [1.5, "70", -1])
def test_strict_money(value):
    with pytest.raises(ValidationError):
        Publish(batch=ID, request_id=ID, kind="percentage", value=value, units=2, title="Test")


def test_no_deadline_injection():
    with pytest.raises(ValidationError):
        Publish(
            batch=ID,
            request_id=ID,
            kind="free",
            value=0,
            units=2,
            title="Test",
            deadline="2099-01-01T00:00:00Z",
        )


def test_fixture_weather_and_signature(monkeypatch):
    monkeypatch.setenv("WEATHER_MODE", "fixture")
    payload = weather_payload(ID, 3.12, 101.65)
    assert payload["source"] == "fixture"
    body, signature = signed_weather(payload, "synthetic-test-secret")
    assert json.loads(body) == payload
    assert (
        signature
        == hmac.new(
            b"synthetic-test-secret", ("weather:" + body).encode(), hashlib.sha256
        ).hexdigest()
    )


def test_provider_failure_does_not_assume_fixture(monkeypatch):
    monkeypatch.setenv("WEATHER_MODE", "unsupported")
    with pytest.raises(ValueError):
        weather_payload(ID, 3.12, 101.65)


def test_missing_worker_configuration_is_closed(monkeypatch):
    monkeypatch.delenv("AGENT_DISPATCH_SECRET", raising=False)
    assert TestClient(app).post("/api/v1/agent/dispatch").status_code == 503


def test_invalid_worker_signature_is_denied(monkeypatch):
    monkeypatch.setenv("APP_ENV", "demo")
    monkeypatch.setenv("AGENT_DISPATCH_SECRET", "x" * 32)
    monkeypatch.setenv("AGENT_DATABASE_URL", "not-contacted")
    assert (
        TestClient(app)
        .post("/api/v1/agent/dispatch", headers={"X-Agent-Secret": "wrong"})
        .status_code
        == 403
    )


def test_new_migration_outer_sql_parses():
    # Syntax-only evidence: does not execute PL/pgSQL bodies or prove RLS/concurrency.
    for name in ["202610010007_freshness_agent.sql", "202610010008_agent_runtime.sql"]:
        assert parse_sql((ROOT / "supabase/migrations" / name).read_text(encoding="utf-8"))


def test_policy_artifact_matches_migration():
    policy = json.loads((ROOT / "contracts/advisory-policy.json").read_text(encoding="utf-8"))
    canonical = json.dumps(policy, separators=(",", ":"))
    assert canonical in (ROOT / "supabase/migrations/202610010007_freshness_agent.sql").read_text(
        encoding="utf-8"
    )
