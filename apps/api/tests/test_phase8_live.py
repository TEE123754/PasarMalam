"""Guarded disposable DB execution; never substitute mocks for the concurrency gate."""

import json
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import psycopg
import pytest
from demo_db import target_configuration, verify_marker
from demo_seed import stable
from test_live_permissions import live as live

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_PHASE8") != "1", reason="Phase 8 disposable Supabase not configured"
    ),
]


def actor(c, user):
    c.execute("reset role")
    c.execute(
        "select set_config('request.jwt.claims',%s,false)",
        (json.dumps({"sub": str(user), "role": "authenticated"}),),
    )
    c.execute("set role authenticated")


def command(c, data, key=None):
    return c.execute(
        "select public.commerce_command(%s::jsonb,%s)", (json.dumps(data), key or uuid4())
    ).fetchone()[0]


@pytest.fixture
def commerce_database(live):
    _, _, identities, _ = live
    _, _, url = target_configuration()
    food, batch, offer = uuid4(), uuid4(), uuid4()
    with psycopg.connect(url, autocommit=True) as c:
        verify_marker(c)
        clock = c.execute("select private.clock_now()").fetchone()[0]
        c.execute(
            "insert into public.food_items(id,stall_id,name,price_sen,ingredients,published) "
            "values(%s,%s,'DEMO commerce test',500,array['chicken'],true)",
            (food, stable("stall-a")),
        )
        c.execute(
            "insert into public.batches(id,food_item_id,batch_number,prepared_at,"
            "original_quantity,remaining_quantity,handling,advisory_deadline,status,"
            "request_id,request_hash) values(%s,%s,1,%s,10,10,"
            "'{\"storage\":\"ambient\"}',%s,'active',%s,'DEMO')",
            (batch, food, clock - timedelta(minutes=5), clock + timedelta(minutes=25), uuid4()),
        )
        c.execute(
            "insert into public.batch_advisories(batch_id,ingredients,confirmed) "
            "values(%s,array['chicken'],true)",
            (batch,),
        )
        c.execute(
            "insert into public.promotions(id,batch_id,title,price_sen,quantity_limit,"
            "starts_at,ends_at,request_id,request_hash,bundle_units) "
            "values(%s,%s,'DEMO test bundle',300,10,%s,%s,%s,'DEMO',2)",
            (offer, batch, clock, clock + timedelta(minutes=8), uuid4()),
        )
        # Test fixture schedules are not mutated: the prior gate must seed an open market.
        actor(c, identities["customer-a"])
        try:
            yield c, identities, batch, offer, url
        finally:
            c.execute("reset role")
            with c.transaction():
                c.execute(
                    "delete from private.commerce_requests where result in "
                    "(select id from private.commerce_records where data->>'batch'=%s)",
                    (str(batch),),
                )
                c.execute(
                    "delete from private.commerce_ledger where order_id in "
                    "(select id from private.commerce_records where data->>'batch'=%s)",
                    (str(batch),),
                )
                c.execute(
                    "delete from private.commerce_records where data->>'batch'=%s", (str(batch),)
                )
                c.execute("delete from public.promotions where id=%s", (offer,))
                c.execute("delete from public.batch_events where batch_id=%s", (batch,))
                c.execute("delete from public.batch_advisories where batch_id=%s", (batch,))
                c.execute("delete from public.batches where id=%s", (batch,))
                c.execute("delete from public.food_items where id=%s", (food,))


def reservation(offer, quantity=2):
    return {
        "kind": "reserve",
        "offer": str(offer),
        "quantity": quantity,
        "fulfilment": "pickup",
        "payment": "stall",
        "eta": 2,
    }


def test_atomic_retry_collection_refund(commerce_database):
    c, identities, batch, offer, _ = commerce_database
    request = uuid4()
    order = command(c, reservation(offer), request)
    assert command(c, reservation(offer), request) == order
    actor(c, identities["customer-b"])
    workspace = c.execute("select public.commerce_workspace()").fetchone()[0]
    assert str(order) not in [o["id"] for o in workspace["commerce"]["orders"]]
    with pytest.raises(psycopg.Error):
        command(c, {"kind": "order", "id": str(order), "action": "cancel"})
    actor(c, identities["vendor-a"])
    command(c, {"kind": "order", "id": str(order), "action": "accept"})
    command(c, {"kind": "order", "id": str(order), "action": "ready"})
    workspace = c.execute("select public.commerce_workspace()").fetchone()[0]
    code = next(o["code"] for o in workspace["commerce"]["orders"] if o["id"] == str(order))
    command(c, {"kind": "order", "id": str(order), "action": "vendor-confirm", "code": code})
    actor(c, identities["customer-a"])
    key = uuid4()
    confirmation = {"kind": "order", "id": str(order), "action": "customer-confirm", "code": code}
    command(c, confirmation, key)
    command(c, confirmation, key)
    actor(c, identities["vendor-a"])
    command(c, {"kind": "refund", "id": str(order), "amount": 300})
    with pytest.raises(psycopg.Error):
        command(c, {"kind": "refund", "id": str(order), "amount": 301})
    workspace = c.execute("select public.commerce_workspace()").fetchone()[0]
    o = next(o for o in workspace["commerce"]["orders"] if o["id"] == str(order))
    assert o["commission"] == 9 and o["refunded"] == 300
    c.execute("reset role")
    assert (
        c.execute("select remaining_quantity from public.batches where id=%s", (batch,)).fetchone()[
            0
        ]
        == 6
    )


def test_concurrent_reservations_and_direct_writes(commerce_database):
    c, identities, _, offer, url = commerce_database

    def reserve(user):
        with psycopg.connect(url, autocommit=True) as connection:
            actor(connection, user)
            try:
                return command(connection, reservation(offer, 3))
            except psycopg.Error as error:
                assert error.sqlstate == "22023"
                return None

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(reserve, [identities["customer-a"], identities["customer-b"]]))
    assert sum(r is not None for r in results) == 1
    with pytest.raises(psycopg.Error):
        c.execute("select * from private.commerce_records")
    with pytest.raises(psycopg.Error):
        c.execute("update private.commerce_policy set rate=0")


def test_unapproved_campaign_cannot_resume_or_leak(commerce_database):
    c, identities, _, _, _ = commerce_database
    actor(c, identities["vendor-a"])
    targets = c.execute("select public.commerce_workspace()").fetchone()[0]["targets"]
    target = next(t for t in targets if t["id"] == str(stable("stall-a")))
    now = datetime.now(timezone.utc)
    with c.transaction():
        campaign = command(
            c,
            {
                "kind": "campaign",
                "stall": target["id"],
                "market": target["marketId"],
                "category": target["category"],
                "radius": 5,
                "start": now.isoformat(),
                "end": (now + timedelta(days=2)).isoformat(),
                "budget": 2,
                "placement": "sponsored",
                "description": "DEMO placeholder",
            },
        )
        with c.transaction(), pytest.raises(psycopg.Error):
            command(c, {"kind": "moderate", "id": str(campaign), "action": "resume"})
        actor(c, identities["customer-a"])
        result = c.execute("select public.commerce_workspace()").fetchone()[0]
        assert str(campaign) not in [r["id"] for r in result["commerce"]["campaigns"]]
        # Keep this temporary campaign inside a rollback-only transaction.
        raise_rollback = psycopg.Rollback
        raise raise_rollback()


def test_delivery_isolation_and_organisation_campaign_scope(commerce_database):
    c, identities, _, offer, _ = commerce_database
    with c.transaction():
        c.execute("reset role")
        delivery_org, advertiser_org = uuid4(), uuid4()
        for organisation, kind in [(delivery_org, "delivery"), (advertiser_org, "advertiser")]:
            c.execute(
                "insert into public.organisations(id,name,kind) values(%s,'DEMO gate',%s)",
                (organisation, kind),
            )
        for user, organisation in [
            (identities["vendor-b"], delivery_org),
            (identities["vendor-a"], advertiser_org),
            (identities["vendor-b"], advertiser_org),
        ]:
            c.execute(
                "insert into public.organisation_members(organisation_id,user_id,membership) "
                "values(%s,%s,'member')",
                (organisation, user),
            )
            c.execute(
                "insert into public.user_roles(user_id,role) values(%s,'partner') "
                "on conflict do nothing",
                (user,),
            )
        actor(c, identities["customer-a"])
        order = command(c, {**reservation(offer, 1), "fulfilment": "delivery"})
        c.execute("reset role")
        c.execute(
            "update private.commerce_records set assigned=%s,"
            "data=jsonb_set(data,'{courier}',to_jsonb(%s::text)) where id=%s",
            (identities["vendor-b"], str(identities["vendor-b"]), order),
        )
        actor(c, identities["vendor-b"])
        workspace = c.execute("select public.commerce_workspace()").fetchone()[0]
        o = next(o for o in workspace["commerce"]["orders"] if o["id"] == str(order))
        assert o["code"] == "" and o["total"] == 0 and o["owner"] == ""
        assert not any(row["order"] == str(order) for row in workspace["commerce"]["ledger"])
        command(c, {"kind": "delivery", "id": str(order), "action": "failed"})
        actor(c, identities["vendor-a"])
        target = next(
            t
            for t in c.execute("select public.commerce_workspace()").fetchone()[0]["targets"]
            if t["id"] == str(stable("stall-a"))
        )
        now = datetime.now(timezone.utc)
        campaign = command(
            c,
            {
                "kind": "campaign",
                "stall": target["id"],
                "market": target["marketId"],
                "category": target["category"],
                "radius": 5,
                "start": now.isoformat(),
                "end": (now + timedelta(days=2)).isoformat(),
                "budget": 2,
                "placement": "banner",
                "description": "DEMO placeholder",
            },
        )
        actor(c, identities["vendor-b"])
        workspace = c.execute("select public.commerce_workspace()").fetchone()[0]
        assert str(campaign) in [row["id"] for row in workspace["commerce"]["campaigns"]]
        actor(c, identities["customer-b"])
        workspace = c.execute("select public.commerce_workspace()").fetchone()[0]
        assert str(campaign) not in [row["id"] for row in workspace["commerce"]["campaigns"]]
        with c.transaction(), pytest.raises(psycopg.Error):
            command(c, {"kind": "delivery", "id": str(order), "action": "arrived"})
        raise psycopg.Rollback()


def test_stock_guard_and_expiry_reject_late_success(commerce_database):
    c, identities, batch, offer, _ = commerce_database
    with c.transaction():
        order = command(c, {**reservation(offer, 2), "payment": "future"})
        c.execute("reset role")
        with c.transaction(), pytest.raises(psycopg.Error):
            c.execute("update public.batches set remaining_quantity=1 where id=%s", (batch,))
        c.execute(
            "update private.commerce_records set data=jsonb_set(data,'{expires}',"
            "to_jsonb((now()-interval '1 minute')::text)) where id=%s",
            (order,),
        )
        actor(c, identities["customer-a"])
        workspace = c.execute("select public.commerce_workspace()").fetchone()[0]
        assert (
            next(o["status"] for o in workspace["commerce"]["orders"] if o["id"] == str(order))
            == "expired"
        )
        with c.transaction(), pytest.raises(psycopg.Error):
            command(c, {"kind": "payment", "id": str(order), "scenario": "success"})
        with c.transaction(), pytest.raises(psycopg.Error):
            command(c, {**reservation(offer), "quantity": 1.5})
        raise psycopg.Rollback()
