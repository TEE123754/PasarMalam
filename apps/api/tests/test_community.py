import shutil
from unittest.mock import patch

import pytest
from app.community import CommunityCommand, normalize_video
from app.main import app
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pglast import parse_sql
from pydantic import ValidationError


@pytest.mark.parametrize("route", ["workspace", "command", "evidence", "evidence-access"])
def test_community_requires_authentication(route):
    client = TestClient(app)
    response = (
        client.get(f"/api/v1/community/{route}")
        if route == "workspace"
        else client.post(
            f"/api/v1/community/{route}",
            json={
                "kind": "report",
                "data": {},
                "request_id": "00000000-0000-4000-8000-000000000001",
            },
        )
    )
    assert response.status_code == 401


def test_unknown_command_and_extra_top_level_rejected():
    with pytest.raises(ValidationError):
        CommunityCommand(kind="publish_raw_complaints", data={}, request_id="bad")


def test_unavailable_video_validator_does_not_claim_validation():
    with patch.object(shutil, "which", return_value=None), pytest.raises(HTTPException) as error:
        normalize_video(b"fake")
    assert error.value.status_code == 503


def test_video_rejects_forged_contents_before_subprocess():
    with (
        patch.object(shutil, "which", return_value="ffmpeg"),
        pytest.raises(HTTPException) as error,
    ):
        normalize_video(b"not actually mp4")
    assert error.value.status_code == 422


def test_community_outer_sql_parses_and_has_private_boundaries():
    from pathlib import Path

    sql = (
        Path(__file__).resolve().parents[3] / "supabase/migrations/202610010011_community.sql"
    ).read_text(encoding="utf-8-sig")
    assert parse_sql(sql)
    assert "revoke execute on function public.submit_complaint" in sql
    assert "private.community_upload_allowed(name)" in sql
    assert "reply_due>now()" in sql
    assert "community_requests.actor=auth.uid()" in sql
