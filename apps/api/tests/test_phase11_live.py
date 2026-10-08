"""Connected catalog idempotency/reset/isolation; never count mocks as database evidence."""

import json
import os

import psycopg
import pytest
from demo_db import target_configuration, verify_marker
from phase11_seed import seed

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_PHASE11") != "1",
        reason="Complete disposable catalog gate not configured",
    ),
]


def snapshot(c):
    return c.execute(
        "select id,prepared_at,uploaded_at,original_quantity from public.batches "
        "where source_scenario in ('phase11','phase11-history') order by id"
    ).fetchall()


def test_complete_catalog_repeat_reset_and_role_isolation():
    _, _, url = target_configuration()
    seed()
    with psycopg.connect(url, autocommit=True, connect_timeout=10) as c:
        verify_marker(c)
        before = snapshot(c)
        row = c.execute(
            "select id,counts from private.demo_seed_runs where retired_at is null"
        ).fetchone()
        assert row[1]["profiles"] == 99 and row[1]["catalog_batches"] == 150
        assert row[1]["historical_batches"] == 24 and row[1]["partner_entries"] == 39
        seed()
        assert snapshot(c) == before
        assert (
            c.execute("select id from private.demo_seed_runs where retired_at is null").fetchone()[
                0
            ]
            == row[0]
        )
        identities = dict(
            c.execute("select persona,user_id from private.demo_identity_map").fetchall()
        )
        with c.transaction():
            c.execute(
                "select set_config('request.jwt.claims',%s,true)",
                (json.dumps({"sub": str(identities["owner-01"]), "role": "authenticated"}),),
            )
            c.execute("set local role authenticated")
            world = c.execute("select public.vendor_workspace()").fetchone()[0]
            assert len(world["stalls"]) == 1
            commerce = c.execute("select public.commerce_workspace()").fetchone()[0]
            assert all(
                o["stall"] == world["stalls"][0]["id"] for o in commerce["commerce"]["orders"]
            )
        seed(reset=True)
        after = {r[0]: r[1:] for r in snapshot(c)}
        assert all(after[r[0]] == r[1:] for r in before)
        assert c.execute(
            "select retired_at is not null from private.demo_seed_runs where id=%s", (row[0],)
        ).fetchone()[0]
        assert (
            c.execute(
                "select count(*) from public.batches where request_hash like %s "
                "and inventory_state='available'",
                (f"phase11:{row[0]}:%",),
            ).fetchone()[0]
            == 0
        )
        assert (
            c.execute(
                "select count(*) from private.commerce_ledger l "
                "join private.commerce_records r on r.id=l.order_id "
                "where r.data->>'seedRun'=%s",
                (str(row[0]),),
            ).fetchone()[0]
            > 0
        )
