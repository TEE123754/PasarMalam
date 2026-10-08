from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pglast import parse_sql
from pydantic import ValidationError

from app.main import app
from app.passports import HandlingData


def data(**changes):
    return {
        "kind": "temperature",
        "effective_at": datetime.now(timezone.utc),
        "value": 70,
        "unit": "C",
        "method": "Manual probe",
        **changes,
    }


@pytest.mark.parametrize(
    "changes",
    [
        {"value": None},
        {"value": True},
        {"value": float("nan")},
        {"value": 301},
        {"value": -101},
        {"method": ""},
        {"unit": "K"},
        {"source": "weather"},
        {"storage": "chilled"},
        {"effective_at": "2026-10-08T18:00:00"},
    ],
)
def test_reject_invalid_manual_measurement(changes):
    with pytest.raises(ValidationError):
        HandlingData(**data(**changes))


def test_original_fahrenheit_and_correction_require_reason():
    value = HandlingData(**data(value=158, unit="F"))
    assert value.value == 158 and value.unit == "F"
    with pytest.raises(ValidationError):
        HandlingData(**data(supersedes="11111111-1111-4111-8111-111111111111"))


def test_append_only_storage_contract():
    assert (
        HandlingData(
            kind="storage", effective_at=datetime.now(timezone.utc), storage="unknown"
        ).source
        == "manual"
    )


def test_qr_allowlist_and_auth_boundaries(monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGINS", "http://127.0.0.1:5174")
    client = TestClient(app)
    response = client.get(
        "/api/v1/passports/qr",
        params={"origin": "http://127.0.0.1:5174", "mode": "demo", "batch": "demo-batch-1"},
    )
    assert response.status_code == 200 and "image/svg+xml" in response.headers["content-type"]
    assert b"<svg" in response.content and response.headers["cache-control"] == "no-store"
    assert (
        client.get(
            "/api/v1/passports/qr",
            params={"origin": "https://attacker.invalid", "mode": "demo", "batch": "x"},
        ).status_code
        == 422
    )
    assert (
        client.get("/api/v1/passports/11111111-1111-4111-8111-111111111111/history").status_code
        == 401
    )


def test_migration_parses():
    root = Path(__file__).resolve().parents[3]
    parse_sql((root / "supabase/migrations/20261008102120_cp4_batch_passports.sql").read_text())
