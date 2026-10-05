"""Phase 10 local transport checks; no network or real subscription used."""

from pathlib import Path
from unittest.mock import Mock, patch

import pytest
from app.main import app
from app.push import NoRedirect, config, send_test, valid_endpoint
from fastapi.testclient import TestClient
from pglast import parse_plpgsql, parse_sql
from pywebpush import WebPushException


@pytest.mark.parametrize(
    "endpoint",
    [
        "http://fcm.googleapis.com/send/x",
        "https://localhost/x",
        "https://fcm.googleapis.com.evil.test/x",
        "https://user@fcm.googleapis.com/x",
        "https://fcm.googleapis.com:444/x",
        "https://web.push.apple.com/x#fragment",
    ],
)
def test_ssrf_boundary(endpoint):
    with pytest.raises(ValueError):
        valid_endpoint(endpoint)


def test_default_disabled_and_routes_require_account(monkeypatch):
    monkeypatch.delenv("PUSH_MODE", raising=False)
    assert not config()["enabled"]
    assert config()["public_key"] == ""
    assert send_test({}) == "disabled"
    assert TestClient(app).post("/api/v1/push/revoke").status_code == 401


def enabled(monkeypatch):
    for key, value in {
        "APP_ENV": "demo",
        "PUSH_MODE": "enrolled-test",
        "VAPID_PRIVATE_KEY": "test-only",
        "VAPID_PUBLIC_KEY": "test-only",
        "VAPID_SUBJECT": "mailto:test@example.invalid",
    }.items():
        monkeypatch.setenv(key, value)


def payload():
    return {
        "subscription": {"endpoint": "https://fcm.googleapis.com/send/test"},
        "message": {"tag": "DEMO-test"},
        "ttl": 999,
    }


def test_accepted_is_not_device_ack_and_ttl_bounded(monkeypatch):
    enabled(monkeypatch)
    with patch("app.push.webpush", return_value=Mock(status_code=201)) as send:
        assert send_test(payload()) == "accepted"
        assert send.call_args.kwargs["ttl"] == 60
        assert send.call_args.kwargs["timeout"] == 5
        assert isinstance(send.call_args.kwargs["requests_session"], NoRedirect)


@pytest.mark.parametrize(
    "code,expected", [(410, "invalid"), (404, "invalid"), (429, "failed"), (500, "failed")]
)
def test_provider_failure_classification(monkeypatch, code, expected):
    enabled(monkeypatch)
    error = WebPushException("internal test", response=Mock(status_code=code))
    with patch("app.push.webpush", side_effect=error):
        assert send_test(payload()) == expected


def test_no_redirects():
    with patch("requests.Session.request", return_value=Mock()) as send:
        NoRedirect().request("POST", "https://fcm.googleapis.com/send/x")
        assert send.call_args.kwargs["allow_redirects"] is False


def test_sql_syntax_only():
    migration = (
        Path(__file__).resolve().parents[3] / "supabase/migrations/20261002104837_test_push.sql"
    )
    sql = migration.read_text(encoding="utf-8")
    assert parse_sql(sql)
    assert parse_plpgsql(sql)
    assert "revoke all on public.push_subscriptions" in sql
    assert "provider-accepted" in sql


def test_incomplete_push_never_consumes_as_simulated(monkeypatch):
    from app.agent import dispatch
    from fastapi import HTTPException

    monkeypatch.setenv("APP_ENV", "demo")
    monkeypatch.setenv("AGENT_DISPATCH_SECRET", "x" * 32)
    monkeypatch.setenv("AGENT_DATABASE_URL", "postgresql://unused")
    monkeypatch.setenv("PUSH_MODE", "enrolled-test")
    monkeypatch.delenv("VAPID_PRIVATE_KEY", raising=False)
    with pytest.raises(HTTPException) as error:
        dispatch("x" * 32)
    assert error.value.status_code == 503


@pytest.mark.parametrize(
    "change",
    [
        {"radius": True},
        {"radius": 499},
        {"radius": 5001},
        {"start": "25:00"},
        {"end": "08:99"},
        {"owner": "foreign"},
    ],
)
def test_preference_input_boundaries(change):
    from app.push import Preferences
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        Preferences.model_validate({"radius": 1500, "start": "22:00", "end": "08:00", **change})
