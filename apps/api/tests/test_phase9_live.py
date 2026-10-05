"""Guarded disposable Phase 9 execution; requires prior live gates."""

import json
import os
from datetime import timedelta
from uuid import uuid4

import psycopg
import pytest
from demo_db import target_configuration, verify_marker
from demo_seed import stable
from test_live_permissions import live as live

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_PHASE9") != "1", reason="Phase 9 disposable project not configured"
    ),
]


def actor(c, user):
    c.execute("reset role")
    c.execute(
        "select set_config('request.jwt.claims',%s,true)",
        (json.dumps({"sub": str(user), "role": "authenticated"}),),
    )
    c.execute("set local role authenticated")


def command(c, data, key=None):
    return c.execute(
        "select public.partners_command(%s::jsonb,%s)", (json.dumps(data), key or uuid4())
    ).fetchone()[0]


@pytest.fixture
def database(live):
    _, _, identities, _ = live
    _, _, url = target_configuration()
    with psycopg.connect(url) as c:
        verify_marker(c)
        yield c, identities
        c.rollback()


def test_media_scope_publication_retry_and_direct_write(database):
    c, ids = database
    org, foreign = uuid4(), uuid4()
    c.execute(
        "insert into public.organisations(id,name,kind) values(%s,'DEMO media','media'),"
        "(%s,'DEMO other media','media')",
        (org, foreign),
    )
    for user, dest in [(ids["vendor-b"], org), (ids["customer-b"], foreign)]:
        c.execute(
            "insert into public.user_roles(user_id,role) values(%s,'partner') "
            "on conflict do nothing",
            (user,),
        )
        c.execute(
            "insert into public.organisation_members(organisation_id,user_id,membership) "
            "values(%s,%s,'member')",
            (dest, user),
        )
    actor(c, ids["vendor-a"])
    data = {
        "kind": "collaboration",
        "stall": str(stable("stall-a")),
        "org": str(org),
        "body": "Fictional feature",
    }
    key = uuid4()
    entry = command(c, data, key)
    assert command(c, data, key) == entry
    command(c, {"kind": "transition", "id": str(entry), "action": "submit", "scenario": "timeout"})
    command(c, {"kind": "transition", "id": str(entry), "action": "submit", "scenario": "success"})
    actor(c, ids["customer-b"])
    assert str(entry) not in json.dumps(
        c.execute("select public.partners_workspace()").fetchone()[0]["entries"]
    )
    with c.transaction(), pytest.raises(psycopg.Error):
        command(c, {"kind": "transition", "id": str(entry), "action": "approve"})
    actor(c, ids["vendor-b"])
    command(c, {"kind": "transition", "id": str(entry), "action": "approve"})
    command(c, {"kind": "transition", "id": str(entry), "action": "publish"})
    assert str(entry) in json.dumps(c.execute("select public.partners_public()").fetchone()[0])
    with c.transaction(), pytest.raises(psycopg.Error):
        c.execute("select * from private.partner_records")


def test_referral_consent_and_private_source_boundary(database):
    c, ids = database
    org = uuid4()
    c.execute(
        "insert into public.organisations(id,name,kind) values(%s,'DEMO authority','authority')",
        (org,),
    )
    actor(c, ids["admin"])
    with c.transaction(), pytest.raises(psycopg.Error):
        command(
            c,
            {
                "kind": "referral",
                "org": str(org),
                "report": str(uuid4()),
                "summary": "Fictional approved summary",
                "consent": False,
            },
        )
    with c.transaction(), pytest.raises(psycopg.Error):
        c.execute("select * from private.partner_links")


def test_permit_approval_expiry_and_renewal(database):
    c, ids = database
    org = uuid4()
    c.execute(
        "insert into public.organisations(id,name,kind) values(%s,'DEMO council','council')", (org,)
    )
    c.execute(
        "insert into public.user_roles(user_id,role) values(%s,'organiser') on conflict do nothing",
        (ids["vendor-b"],),
    )
    c.execute(
        "insert into public.organiser_memberships(user_id,market_id) values(%s,%s) "
        "on conflict do nothing",
        (ids["vendor-b"], stable("market-a")),
    )
    c.execute(
        "insert into public.organisation_members(organisation_id,user_id,membership) "
        "values(%s,%s,'member')",
        (org, ids["vendor-b"]),
    )
    actor(c, ids["vendor-a"])
    entry = command(
        c,
        {
            "kind": "permit",
            "org": str(org),
            "stall": str(stable("stall-a")),
            "body": "Fictional application",
        },
    )
    command(c, {"kind": "transition", "id": str(entry), "action": "submit", "scenario": "success"})
    actor(c, ids["vendor-b"])
    command(c, {"kind": "transition", "id": str(entry), "action": "approve"})
    c.execute("reset role")
    clock = c.execute("select private.clock_now()").fetchone()[0]
    c.execute(
        "update private.partner_records set data=jsonb_set(data,'{expires}',to_jsonb(%s::text)) "
        "where id=%s",
        ((clock - timedelta(minutes=1)).isoformat(), entry),
    )
    actor(c, ids["vendor-a"])
    rows = c.execute("select public.partners_workspace()").fetchone()[0]["entries"]
    assert next(e for e in rows if e["id"] == str(entry))["status"] == "expired"
    command(c, {"kind": "transition", "id": str(entry), "action": "renew"})
