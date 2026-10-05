"""Guarded connected scope/RPC/direct-write tests; unavailable DB is never a pass."""

import json
import os
from uuid import uuid4

import psycopg
import pytest
from demo_db import target_configuration, verify_marker
from demo_seed import stable
from test_live_permissions import live as live

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_PHASE7") != "1", reason="Phase 7 disposable Supabase unavailable"
    ),
]


@pytest.fixture
def community_database(live):
    _, _, identities, _ = live
    _, _, url = target_configuration()
    with psycopg.connect(url) as connection:
        verify_marker(connection)
        connection.execute(
            "select set_config('request.jwt.claims',%s,true)",
            (json.dumps({"sub": str(identities["customer-a"]), "role": "authenticated"}),),
        )
        connection.execute("set local role authenticated")
        yield connection
        connection.rollback()


def test_review_rpc_retry_and_pending_exclusion(community_database):
    c = community_database
    data = json.dumps({"stall": str(stable("stall-a")), "rating": 4, "body": "Fictional review."})
    request = uuid4()
    first = c.execute(
        "select public.community_command('review',%s::jsonb,%s)", (data, request)
    ).fetchone()[0]
    assert (
        c.execute(
            "select public.community_command('review',%s::jsonb,%s)", (data, request)
        ).fetchone()[0]
        == first
    )
    public = c.execute("select public.community_public()").fetchone()[0]
    assert all(r["id"] != first for r in public["reviews"])


def test_member_cannot_moderate_or_read_private_audit(community_database):
    c = community_database
    with c.transaction(), pytest.raises(psycopg.Error):
        c.execute("select * from private.community_audit")
    with c.transaction(), pytest.raises(psycopg.Error):
        c.execute(
            "select public.community_command('flag',%s::jsonb,%s)",
            (json.dumps({"stall": str(stable("stall-a")), "reason": "Fake decision"}), uuid4()),
        )


def test_direct_review_and_raw_complaint_writes_denied(community_database):
    c = community_database
    for sql in ["update public.reviews set status='published'", "delete from public.complaints"]:
        with c.transaction(), pytest.raises(psycopg.Error):
            c.execute(sql)


def test_direct_evidence_attestation_forgery_denied(community_database):
    c = community_database
    with c.transaction(), pytest.raises(psycopg.Error):
        c.execute(
            "select public.authorize_community_evidence(%s,'authorize','forged')",
            (f"{uuid4()}/{uuid4()}.jpg",),
        )
