"""Operator decisions use mocks, never delete actual objects in the local gate."""

from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock

import httpx
import media_sweep
import pytest
from pglast import parse_sql


@pytest.mark.parametrize(
    "attached,apply,network_error,removed",
    [
        (True, True, False, 0),
        (False, False, False, 0),
        (False, True, False, 1),
        (False, True, True, 0),
    ],
)
def test_sweep_rechecks_attachment_dry_run_and_retry(
    monkeypatch, attached, apply, network_error, removed
):
    monkeypatch.setenv("SUPABASE_SECRET_KEY", "sb_secret_synthetic")
    monkeypatch.setattr(
        media_sweep,
        "target_configuration",
        lambda: ("local", "http://127.0.0.1:54321", "synthetic"),
    )
    monkeypatch.setattr(media_sweep, "verify_marker", lambda c: None)
    connection = MagicMock()

    def execute(sql, args=None):
        result = MagicMock()
        if "select object_key,actor_id" in sql:
            result.fetchall.return_value = [("synthetic.jpg", "actor")]
        elif "select id from" in sql:
            result.fetchone.return_value = ("actor",)
        elif "select object_key from" in sql:
            result.fetchone.return_value = ("synthetic.jpg",)
        elif "select exists" in sql:
            result.fetchone.return_value = (attached,)
        return result

    connection.execute.side_effect = execute
    connect = MagicMock()
    connect.return_value.__enter__.return_value = connection
    monkeypatch.setattr(media_sweep.psycopg, "connect", connect)
    client = MagicMock()
    client.request.side_effect = httpx.ConnectError("synthetic timeout") if network_error else None
    client.request.return_value = SimpleNamespace(status_code=200)
    factory = MagicMock()
    factory.return_value.__enter__.return_value = client
    monkeypatch.setattr(media_sweep.httpx, "Client", factory)
    media_sweep.sweep(apply)
    sqls = [call.args[0] for call in connection.execute.call_args_list]
    assert sum("delete from private.listing_uploads" in sql for sql in sqls) == removed
    assert client.request.call_count == int(apply and not attached)
    if network_error and apply and not attached:
        assert any("media-sweep-retry" in sql for sql in sqls)


def test_abandoned_upload_outer_migration_and_scheduler():
    root = Path(__file__).resolve().parents[3]
    source = (root / "supabase/migrations/202610010010_abandoned_uploads.sql").read_text(
        encoding="utf-8"
    )
    assert parse_sql(source)
    assert "abandoned_at is null" in source
    assert "for update" in source
    assert 'cronSchedule = "0 * * * *"' in (root / "scripts/media-sweep.railway.toml").read_text(
        encoding="utf-8"
    )
