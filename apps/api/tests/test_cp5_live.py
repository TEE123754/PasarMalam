import os
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from uuid import uuid4

import httpx
import pytest
from test_cp1_live import connected as connected
from test_cp1_live import listing as listing

from app.settings import get_settings

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(os.getenv("RUN_LIVE_CP5") != "1", reason="Explicit CP5 disposable gate"),
]


@pytest.fixture
def accounting_listing(listing):
    c, api, direct, sessions, stall, food, save = listing
    r = direct.post(
        "/auth/v1/token?grant_type=password",
        json={
            "email": "customer-a@pasarmalam.invalid",
            "password": os.environ["DEMO_SEED_PASSWORD"],
        },
    )
    assert r.status_code == 200
    sessions = {**sessions, "customer": {"Authorization": f"Bearer {r.json()['access_token']}"}}
    batches = []
    requests = []
    market = c.execute(
        "select id from public.markets where published "
        "and private.market_close(id)>private.clock_now()+interval '40 minutes' "
        "order by id limit 1"
    ).fetchone()
    assert market, "No open disposable market session"
    stall = {**stall, "market_id": str(market[0])}
    assert save("stall", stall).status_code == 200

    def new_batch(quantity=20):
        clock = c.execute("select private.clock_now()").fetchone()[0]
        r = save(
            "batch",
            {
                "food_item_id": food["id"],
                "prepared_at": (clock - timedelta(minutes=1)).isoformat(),
                "quantity": quantity,
                "handling": {"storage": "ambient", "note": "CP5 fictional"},
                "photo": None,
            },
        )
        assert r.status_code == 200
        bid = r.json()["id"]
        batches.append(bid)
        r = api.post(
            "/api/v1/freshness/confirm",
            headers=sessions["vendor-a"],
            json={
                "batch": bid,
                "ingredients": ["rice"],
                "confirmed": True,
                "ambient": True,
                "request_id": str(uuid4()),
            },
        )
        assert r.status_code == 200
        return bid

    def command(bid, kind="normal", units=2, persona="vendor-a", key=None):
        key = key or str(uuid4())
        requests.append(key)
        return api.post(
            "/api/v1/accounting/command",
            headers=sessions[persona],
            json={
                "batch": bid,
                "kind": kind,
                "units": units,
                "note": "CP5 fictional report",
                "request_id": key,
            },
        )

    def commercial(data, persona="vendor-a", key=None):
        key = key or str(uuid4())
        requests.append(key)
        return api.post(
            "/api/v1/commerce/command",
            headers=sessions[persona],
            json={"action": data, "request_id": key},
        )

    try:
        yield c, api, sessions, stall, food, save, new_batch, command, commercial
    finally:
        orders = c.execute(
            "select id from private.commerce_records where stall=%s", (stall["id"],)
        ).fetchall()
        ids = [x[0] for x in orders]
        c.execute("delete from private.commerce_ledger where order_id=any(%s::uuid[])", (ids,))
        c.execute("delete from private.commerce_records where stall=%s", (stall["id"],))
        c.execute(
            "delete from private.partner_log where entry in (select id from "
            "private.partner_records where stall=%s)",
            (stall["id"],),
        )
        c.execute(
            "delete from private.partner_requests where result in (select id from "
            "private.partner_records where stall=%s)",
            (stall["id"],),
        )
        c.execute("delete from private.partner_records where stall=%s", (stall["id"],))

        c.execute(
            "delete from private.commerce_requests where request=any(%s::uuid[])", (requests,)
        )
        c.execute("delete from private.cp5_requests where request=any(%s::uuid[])", (requests,))
        c.execute(
            "delete from public.notification_outbox where promotion_id in "
            "(select id from public.promotions where batch_id=any(%s::uuid[]))",
            (batches,),
        )
        c.execute(
            "delete from public.inventory_outcomes where batch_id=any(%s::uuid[])", (batches,)
        )
        c.execute("delete from public.promotions where batch_id=any(%s::uuid[])", (batches,))
        for table in ["alerts", "clearance_drafts", "batch_advisories", "batch_events"]:
            c.execute(f"delete from public.{table} where batch_id=any(%s::uuid[])", (batches,))
        c.execute("delete from public.batches where id=any(%s::uuid[])", (batches,))


def publish(api, sessions, bid, kind="bogo"):
    r = api.post(
        "/api/v1/freshness/publish",
        headers=sessions["vendor-a"],
        json={
            "batch": bid,
            "kind": kind,
            "value": 50,
            "units": 20,
            "title": "CP5 fictional clearance",
            "request_id": str(uuid4()),
        },
    )
    assert r.status_code == 200, r.text
    return r.json()


def test_session_retry_privacy_legacy_and_closing(accounting_listing):
    c, api, sessions, stall, food, save, new, command, commercial = accounting_listing
    bid = new()
    key = str(uuid4())
    assert command(bid, key=key).status_code == 200
    assert command(bid, key=key).status_code == 200
    assert command(bid, units=3, key=key).status_code == 409
    assert command(bid, persona="vendor-b").status_code == 403
    assert save("action", {"batch_id": bid, "action": "consume", "quantity": 1}).status_code == 200
    assert command(bid, "giveaway", 1).status_code == 200
    assert command(bid, "discard", 2).status_code == 200
    r = api.get("/api/v1/accounting/workspace", headers=sessions["vendor-a"])
    assert r.status_code == 200 and r.headers["cache-control"] == "no-store"
    row = next(s for s in r.json()["report"]["sessions"] if s["stall"] == stall["id"])
    assert (
        row["prepared"] == 20
        and row["normal"] == 3
        and row["giveaway"] == 1
        and row["discard"] == 2
        and row["remaining"] == 14
        and row["reconciled"]
    )
    foreign = api.get("/api/v1/accounting/workspace", headers=sessions["vendor-b"]).json()
    assert not any(b["id"] == bid for b in foreign["raw"]["batches"])
    assert api.get("/api/v1/accounting/workspace").status_code == 401
    assert command(bid, "close", None).status_code == 200
    assert command(bid).status_code == 422
    assert save("action", {"batch_id": bid, "action": "available"}).status_code == 422
    row = next(
        s
        for s in api.get("/api/v1/accounting/workspace", headers=sessions["vendor-a"]).json()[
            "report"
        ]["sessions"]
        if s["stall"] == stall["id"]
    )
    assert row["closing_leftovers"] == 14 and row["closed"]
    unknown = new(None)
    assert command(unknown).status_code == 422
    r = api.get("/api/v1/accounting/workspace", headers=sessions["vendor-a"]).json()
    unknown_row = next(b for b in r["report"]["batches"] if b["id"] == unknown)
    assert unknown_row["difference"] is None and unknown_row["prepared"] is None
    assert command(unknown, "close", None).status_code == 200


@pytest.mark.parametrize("kind", ["bogo", "free"])
def test_collection_snapshot_refund_and_cancel(accounting_listing, kind):
    c, api, sessions, stall, food, save, new, command, commercial = accounting_listing
    bid = new()
    offer = publish(api, sessions, bid, kind)
    r = commercial(
        {
            "kind": "reserve",
            "offer": offer,
            "quantity": 1,
            "fulfilment": "pickup",
            "payment": "stall",
            "eta": 0,
        },
        "customer",
    )
    assert r.status_code == 200, r.text
    oid = r.json()["id"]
    assert save("food", {**food, "price_sen": 999}).status_code == 200
    for action in ["accept", "ready"]:
        assert commercial({"kind": "order", "id": oid, "action": action}).status_code == 200
    order = next(
        o
        for o in api.get("/api/v1/commerce/workspace", headers=sessions["vendor-a"]).json()[
            "commerce"
        ]["orders"]
        if o["id"] == oid
    )
    for persona, action in [("vendor-a", "vendor-confirm"), ("customer", "customer-confirm")]:
        assert (
            commercial(
                {"kind": "order", "id": oid, "action": action, "code": order["code"]}, persona
            ).status_code
            == 200
        )
    r = api.get("/api/v1/accounting/workspace", headers=sessions["vendor-a"]).json()
    m = next(m for m in r["raw"]["movements"] if m["id"] == f"order:{oid}")
    assert m["original_total"] == (1000 if kind == "bogo" else 500)
    assert m["total"] == (500 if kind == "bogo" else 0)
    assert m["bundle"] == (2 if kind == "bogo" else 1)
    if kind == "bogo":
        assert commercial({"kind": "refund", "id": oid, "amount": 250}).status_code == 200
        r = api.get("/api/v1/accounting/workspace", headers=sessions["vendor-a"]).json()
        row = next(s for s in r["report"]["sessions"] if s["stall"] == stall["id"])
        assert (
            row["confirmed_revenue"] == 250
            and row["confirmed_savings"] == 250
            and row["remaining"] == 18
        )
    r = commercial(
        {
            "kind": "reserve",
            "offer": offer,
            "quantity": 1,
            "fulfilment": "pickup",
            "payment": "stall",
            "eta": 0,
        },
        "customer",
    )
    assert r.status_code == 200
    cancelled = r.json()["id"]
    assert (
        commercial({"kind": "order", "id": cancelled, "action": "cancel"}, "customer").status_code
        == 200
    )
    assert (
        c.execute("select count(*) from private.cp5_movements where batch=%s", (bid,)).fetchone()[0]
        == 1
    )
    assert (
        commercial(
            {
                "kind": "reserve",
                "offer": offer,
                "quantity": 1,
                "fulfilment": "pickup",
                "payment": "stall",
                "eta": 60,
            },
            "customer",
        ).status_code
        == 422
    )


def test_direct_sale_reservation_race(accounting_listing):
    c, api, sessions, stall, food, save, new, command, commercial = accounting_listing
    bid = new()
    offer = publish(api, sessions, bid)
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(
            pool.map(
                lambda fn: fn(),
                [
                    lambda: command(bid, units=18),
                    lambda: commercial(
                        {
                            "kind": "reserve",
                            "offer": offer,
                            "quantity": 2,
                            "fulfilment": "pickup",
                            "payment": "stall",
                            "eta": 0,
                        },
                        "customer",
                    ),
                ],
            )
        )
    assert sorted(r.status_code for r in results) == [200, 422]
    row = next(
        b
        for b in api.get("/api/v1/accounting/workspace", headers=sessions["vendor-a"]).json()[
            "report"
        ]["batches"]
        if b["id"] == bid
    )
    assert row["reconciled"] and row["remaining"] >= row["held"]


@pytest.mark.parametrize(
    "route,persona,org_kind",
    [
        ("donation", "partner-07", "charity"),
        ("compost", "partner-08", "waste"),
        ("bsf", "partner-09", "waste"),
    ],
)
def test_partner_collection_deduplicates_same_stock(accounting_listing, route, persona, org_kind):
    c, api, sessions, stall, food, save, new, command, commercial = accounting_listing
    settings = get_settings()
    with httpx.Client(
        base_url=settings.url, headers={"apikey": settings.publishable_key}, timeout=20
    ) as direct:
        token = direct.post(
            "/auth/v1/token?grant_type=password",
            json={
                "email": f"{persona}@pasarmalam.invalid",
                "password": os.environ["DEMO_SEED_PASSWORD"],
            },
        )
    assert token.status_code == 200
    partner = {"Authorization": f"Bearer {token.json()['access_token']}"}
    org = c.execute(
        "select o.id from public.organisations o join public.organisation_members m on "
        "m.organisation_id=o.id join auth.users u on u.id=m.user_id where u.email=%s and "
        "o.kind=%s limit 1",
        (f"{persona}@pasarmalam.invalid", org_kind),
    ).fetchone()[0]
    bid = new()

    def action(data, headers, key=None):
        return api.post(
            "/api/v1/partners/command",
            headers=headers,
            json={"action": data, "request_id": key or str(uuid4())},
        )

    created = action(
        {
            "kind": "collection",
            "batch": bid,
            "org": str(org),
            "route": route,
            "units": 3,
            "estimatedGrams": 0,
        },
        sessions["vendor-a"],
    )
    assert created.status_code == 200
    eid = created.json()["id"]
    assert command(bid, units=18).status_code == 422
    assert action({"kind": "transition", "id": eid, "action": "accept"}, partner).status_code == 200
    clock = c.execute("select private.clock_now()").fetchone()[0]
    assert (
        action(
            {
                "kind": "transition",
                "id": eid,
                "action": "schedule",
                "scheduled": (clock + timedelta(seconds=4)).isoformat(),
            },
            partner,
        ).status_code
        == 200
    )
    time.sleep(4)
    key = str(uuid4())
    data = {"kind": "transition", "id": eid, "action": "collect", "weighedGrams": 0}
    assert action(data, partner, key).status_code == 200
    assert action(data, partner, key).status_code == 200
    result = api.get("/api/v1/accounting/workspace", headers=sessions["vendor-a"]).json()
    row = next(s for s in result["report"]["sessions"] if s["stall"] == stall["id"])
    assert row[route] == 3 and row["remaining"] == 17 and row["reconciled"]
    assert len([m for m in result["raw"]["movements"] if m["batch"] == bid]) == 1


def test_no_show_releases_hold_without_sale(accounting_listing):
    c, api, sessions, stall, food, save, new, command, commercial = accounting_listing
    bid = new()
    offer = publish(api, sessions, bid)
    booked = commercial(
        {
            "kind": "reserve",
            "offer": offer,
            "quantity": 1,
            "fulfilment": "pickup",
            "payment": "stall",
            "eta": 0,
        },
        "customer",
    )
    assert booked.status_code == 200
    oid = booked.json()["id"]
    c.execute(
        "update private.commerce_records set "
        "data=jsonb_set(data,'{expires}',to_jsonb((private.clock_now()-interval '1 "
        "second')::text)) where id=%s",
        (oid,),
    )
    result = api.get("/api/v1/accounting/workspace", headers=sessions["vendor-a"]).json()
    row = next(b for b in result["report"]["batches"] if b["id"] == bid)
    assert (
        row["held"] == 0 and row["remaining"] == 20 and row["consumed"] == 0 and row["reconciled"]
    )
    assert commercial({"kind": "order", "id": oid, "action": "accept"}).status_code == 422
    assert not [m for m in result["raw"]["movements"] if m["batch"] == bid]
