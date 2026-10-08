"""Live collection/commerce stock and push lease boundaries; no push network calls."""

import json
import os
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from uuid import uuid4

import psycopg
import pytest
from test_live_permissions import live as live
from test_phase8_live import actor, command, reservation
from test_phase8_live import commerce_database as commerce_database

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(
        os.getenv("RUN_LIVE_PHASE9") != "1", reason="Guarded connected edges not enabled"
    ),
]


def partner(c, data, key=None):
    return c.execute(
        "select public.partners_command(%s::jsonb,%s)", (json.dumps(data), key or uuid4())
    ).fetchone()[0]


def test_donation_shopper_race_and_weighed_collection_dedup(commerce_database):
    c, ids, batch, offer, url = commerce_database
    c.execute("reset role")
    collector, org = c.execute(
        "select m.user_id,m.organisation_id from public.organisation_members m "
        "join public.organisations o on o.id=m.organisation_id where o.kind='charity' limit 1"
    ).fetchone()
    donation = {
        "kind": "collection",
        "batch": str(batch),
        "org": str(org),
        "route": "donation",
        "units": 6,
        "estimatedGrams": 900,
    }

    def compete(which):
        with psycopg.connect(url, autocommit=True, connect_timeout=10) as connection:
            actor(connection, ids["vendor-a" if which == "donation" else "customer-a"])
            try:
                result = (
                    partner(connection, donation)
                    if which == "donation"
                    else command(connection, reservation(offer, 4))
                )
                return which, result
            except psycopg.Error as error:
                assert error.sqlstate == "22023"
                return which, None

    try:
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = dict(pool.map(compete, ["donation", "shopper"]))
        assert sum(value is not None for value in results.values()) == 1
        if results["shopper"]:
            actor(c, ids["customer-a"])
            command(c, {"kind": "order", "id": str(results["shopper"]), "action": "cancel"})
            actor(c, ids["vendor-a"])
            entry = partner(c, donation)
        else:
            entry = results["donation"]
        actor(c, collector)
        partner(c, {"kind": "transition", "id": str(entry), "action": "accept"})
        c.execute("reset role")
        due = c.execute("select private.clock_now()").fetchone()[0] + timedelta(seconds=1)
        actor(c, collector)
        partner(
            c,
            {
                "kind": "transition",
                "id": str(entry),
                "action": "schedule",
                "scheduled": due.isoformat(),
            },
        )
        time.sleep(1.2)
        key = uuid4()
        collected = {
            "kind": "transition",
            "id": str(entry),
            "action": "collect",
            "weighedGrams": 870,
        }
        assert partner(c, collected, key) == partner(c, collected, key)
        with pytest.raises(psycopg.Error):
            partner(c, collected)
        c.execute("reset role")
        assert (
            c.execute(
                "select remaining_quantity from public.batches where id=%s", (batch,)
            ).fetchone()[0]
            == 4
        )
        assert (
            c.execute(
                "select count(*) from public.batch_events where batch_id=%s "
                "and details->>'source'='DEMO collection'",
                (batch,),
            ).fetchone()[0]
            == 1
        )
        assert (
            c.execute(
                "select data->>'weighedGrams' from private.partner_records where id=%s", (entry,)
            ).fetchone()[0]
            == "870"
        )
    finally:
        c.execute("reset role")
        with c.transaction():
            c.execute(
                "delete from private.partner_requests where result in "
                "(select id from private.partner_records where data->>'batch'=%s)",
                (str(batch),),
            )
            c.execute(
                "delete from private.partner_log where entry in "
                "(select id from private.partner_records where data->>'batch'=%s)",
                (str(batch),),
            )
            c.execute("delete from private.partner_records where data->>'batch'=%s", (str(batch),))


@pytest.mark.parametrize(
    "boundary", ["revocation", "lease", "radius", "quiet", "replacement", "invalid"]
)
def test_push_revocation_lease_expiry_and_stale_completion(commerce_database, boundary):
    c, ids, batch, offer, _ = commerce_database
    c.execute("reset role")
    with c.transaction():
        owner = ids["customer-a"]
        c.execute(
            "insert into public.notification_preferences(owner_id,push_opt_in,coarse_cell,"
            "location_expires_at,quiet_start,quiet_end) select %s,true,"
            "round(extensions.st_y(m.location::extensions.geometry)::numeric,2)::text||','||"
            "round(extensions.st_x(m.location::extensions.geometry)::numeric,2)::text,"
            "now()+interval '2 hours','00:00','00:00' from public.markets m "
            "join public.stalls s on s.market_id=m.id join public.food_items f on f.stall_id=s.id "
            "join public.batches b on b.food_item_id=f.id where b.id=%s "
            "on conflict(owner_id) do update set push_opt_in=true,coarse_cell=excluded.coarse_cell,"
            "location_expires_at=excluded.location_expires_at,quiet_start='00:00',quiet_end='00:00'",
            (owner, batch),
        )
        actor(c, owner)
        endpoint = "https://fcm.googleapis.com/send/DEMO-" + str(uuid4())
        c.execute("select public.push_enrol(%s,%s,%s)", (endpoint, "A" * 87, "B" * 22))
        c.execute("reset role")
        token = uuid4()
        queue = c.execute(
            "insert into public.notification_outbox(owner_id,batch_id,promotion_id,"
            "channel,dedup_key,expires_at,status,lease_token,lease_until,attempts) "
            "values(%s,%s,%s,'in-app',%s,now()+interval '5 minutes','leased',%s,"
            "now()+interval '30 seconds',1) returning id",
            (owner, batch, offer, "edge:" + str(uuid4()), token),
        ).fetchone()[0]
        payload = c.execute("select private.push_payload(%s,%s)", (queue, token)).fetchone()[0]
        assert payload and payload["message"]["tag"] == "DEMO-" + str(queue)
        if boundary == "lease":
            c.execute(
                "update public.notification_outbox set lease_until=now()-interval '1 second' "
                "where id=%s", (queue,)
            )
            assert c.execute(
                "select private.push_payload(%s,%s)", (queue, token)
            ).fetchone()[0] is None
            assert c.execute(
                "select private.push_finish(%s,%s,'accepted',%s)", (queue, token, endpoint)
            ).fetchone()[0] == "stale-lease"
            claims = c.execute("select private.claim_dispatch()").fetchone()[0]
            reclaimed = next(claim for claim in claims if str(claim["id"]) == str(queue))
            assert str(reclaimed["token"]) != str(token)
            renewed = c.execute(
                "select private.push_payload(%s,%s)", (queue, reclaimed["token"])
            ).fetchone()[0]
            assert renewed and renewed["message"]["tag"] == payload["message"]["tag"]
        elif boundary in {"radius", "quiet"}:
            if boundary == "radius":
                c.execute(
                    "update public.notification_preferences set coarse_cell='0,0' "
                    "where owner_id=%s",
                    (owner,),
                )
            else:
                c.execute(
                    "update public.notification_preferences set "
                    "quiet_start=((now() at time zone 'Asia/Kuala_Lumpur')"
                    "-interval '1 minute')::time,"
                    "quiet_end=((now() at time zone 'Asia/Kuala_Lumpur')"
                    "+interval '1 minute')::time "
                    "where owner_id=%s", (owner,)
                )
            assert c.execute(
                "select private.push_payload(%s,%s)", (queue, token)
            ).fetchone()[0] is None
        elif boundary in {"replacement", "invalid"}:
            if boundary == "replacement":
                actor(c, owner)
                c.execute(
                    "select public.push_enrol(%s,%s,%s)", (endpoint + "-new", "C" * 87, "D" * 22)
                )
                c.execute("reset role")
            assert c.execute(
                "select private.push_finish(%s,%s,'invalid',%s)", (queue, token, endpoint)
            ).fetchone()[0] == "cancelled"
            remaining = c.execute(
                "select endpoint from private.test_push_subscriptions where owner_id=%s", (owner,)
            ).fetchone()
            assert remaining == ((endpoint + "-new",) if boundary == "replacement" else None)
        if boundary != "revocation":
            raise psycopg.Rollback()
        actor(c, owner)
        c.execute("select public.push_revoke()")
        c.execute("reset role")
        assert c.execute("select private.push_payload(%s,%s)", (queue, token)).fetchone()[0] is None
        assert (
            c.execute(
                "select private.push_finish(%s,%s,'accepted',%s)", (queue, token, endpoint)
            ).fetchone()[0]
            == "stale-lease"
        )
        assert (
            c.execute(
                "select status from public.notification_outbox where id=%s", (queue,)
            ).fetchone()[0]
            == "cancelled"
        )
        raise psycopg.Rollback()
