"""Operator-only fictional workflow history and non-destructive seed generations."""

import hashlib
import json
from datetime import timedelta


def start_run(db, catalog, reset):
    db.execute("select pg_advisory_xact_lock(517011)")
    fingerprint = hashlib.sha256(
        json.dumps(catalog, sort_keys=True).encode()
    ).hexdigest()
    row = db.execute(
        "select id,created_at,completed_at,catalog_hash from private.demo_seed_runs where retired_at is null for update"
    ).fetchone()
    if row and not reset:
        if row[3] != fingerprint:
            raise ValueError(
                "Catalog changed; use explicit --reset-to-today to retire the previous generation"
            )
        return row[0], row[1], row[2] is not None
    if row:
        # Cancel only generation-tagged simulation holds before retiring their batches.
        db.execute(
            'update private.commerce_records set data=data||\'{"status":"cancelled","delivery":"cancelled"}\'::jsonb where kind=\'order\' and data->>\'seedRun\'=%s and private.commerce_active(data)',
            (str(row[0]),),
        )
        db.execute(
            "update private.commerce_records set data=data||'{\"status\":\"paused\",\"retired\":true}'::jsonb where kind='campaign' and data->>'seedRun'=%s",
            (str(row[0]),),
        )
        db.execute(
            "update private.partner_records set data=data||'{\"status\":\"archived\",\"public\":false}'::jsonb where kind in ('collaboration','trail') and data->>'seedRun'=%s and data->>'status'='published'",
            (str(row[0]),),
        )
        db.execute(
            "update private.partner_records set data=data||'{\"status\":\"cancelled\"}'::jsonb where kind='collection' and data->>'seedRun'=%s and data->>'status' in ('requested','accepted','scheduled')",
            (str(row[0]),),
        )
        # Refuse rather than invalidate untagged shopper/collector reservations.
        held = db.execute(
            "select exists(select 1 from public.batches where request_hash like %s and private.commerce_held(id)>0)",
            (f"phase11:{row[0]}:%",),
        ).fetchone()[0]
        if held:
            raise ValueError(
                "Fulfil or cancel current reservations before resetting this demo"
            )
        db.execute(
            "insert into public.batch_events(batch_id,kind,request_id,details) select id,'demo-run-retired',gen_random_uuid(),jsonb_build_object('run',%s::text,'previous_prepared_at',prepared_at,'reason','explicit reset to today; new batches required') from public.batches where request_hash like %s",
            (str(row[0]), f"phase11:{row[0]}:%"),
        )
        db.execute(
            "update public.promotions set status='withdrawn' where status='active' and batch_id in(select id from public.batches where request_hash like %s)",
            (f"phase11:{row[0]}:%",),
        )
        db.execute(
            "update public.batches set status='withdrawn',inventory_state='withdrawn' where inventory_state='available' and request_hash like %s",
            (f"phase11:{row[0]}:%",),
        )
        db.execute(
            "update private.demo_seed_runs set retired_at=now() where id=%s", (row[0],)
        )
    row = db.execute(
        "insert into private.demo_seed_runs(catalog_hash) values(%s) returning id,created_at",
        (fingerprint,),
    ).fetchone()
    return row[0], row[1], False


def seed_workflows(db, catalog, people, run, now, stable):
    """History references separate closed stock; it never consumes current food batches."""
    stalls = catalog["discovery"]["stalls"]
    menu = catalog["discovery"]["menu"]
    stamp = (now - timedelta(days=1)).isoformat()
    advertiser = people["partner-10"]
    courier = people["partner-11"]
    for i in range(24):
        stall = stalls[i % len(stalls)]
        food = next(f for f in menu if f["stallId"] == stall["id"])
        batch = stable(f"{run}:archive-batch:{i}")
        offer = stable(f"{run}:archive-offer:{i}")
        order = stable(f"{run}:order:{i}")
        owner = people[f"shopper-{i % 50 + 1:02}"]
        total = 400 + i % 4 * 100
        completed = i < 12
        refunded = total if i < 6 else 0
        commission = (total - refunded) * 300 // 10000 if completed else 0
        db.execute(
            "select id from public.food_items where id=%s for update",
            (stable(food["id"]),),
        )
        inserted = db.execute(
            "insert into public.batches(id,food_item_id,batch_number,prepared_at,uploaded_at,original_quantity,remaining_quantity,handling,status,inventory_state,request_id,request_hash,source_scenario) select %s,id,next_batch_number,%s,%s,20,0,'{\"storage\":\"ambient\",\"note\":\"Fictional historical stock; never available for reservation\"}', 'sold-out','sold-out',%s,%s,'phase11-history' from public.food_items where id=%s on conflict(id) do nothing returning id",
            (
                batch,
                stamp,
                stamp,
                stable(f"{run}:archive-request:{i}"),
                f"phase11:{run}:history:{i}",
                stable(food["id"]),
            ),
        ).fetchone()
        if inserted:
            db.execute(
                "update public.food_items set next_batch_number=next_batch_number+1 where id=%s",
                (stable(food["id"]),),
            )
            db.execute(
                "insert into public.batch_events(batch_id,kind,request_id,details) values(%s,'synthetic-history',%s,%s)",
                (
                    batch,
                    stable(f"{run}:archive-audit:{i}"),
                    json.dumps(
                        {
                            "run": str(run),
                            "fictional": True,
                            "current_stock_consumed": False,
                        }
                    ),
                ),
            )
        db.execute(
            "insert into public.promotions(id,batch_id,title,price_sen,quantity_limit,starts_at,ends_at,status,request_id,request_hash,source_scenario) values(%s,%s,'DEMO archived clearance',%s,2,%s,%s,'expired',%s,%s,'phase11-history') on conflict(id) do nothing",
            (
                offer,
                batch,
                total,
                now - timedelta(days=1, minutes=30),
                now - timedelta(days=1),
                stable(f"{run}:archive-promo:{i}"),
                f"phase11:{run}:archive-promo:{i}",
            ),
        )
        data = dict(
            id=str(order),
            owner=str(owner),
            stall=str(stable(stall["id"])),
            market=str(stable(stall["marketId"])),
            batch=str(batch),
            offer=str(offer),
            units=1,
            total=total,
            expires=stamp,
            status="completed"
            if completed
            else ["cancelled", "rejected", "failed", "expired"][i % 4],
            fulfilment="delivery" if i < 8 else "pickup",
            payment="stall",
            paid=completed,
            vendorConfirmed=completed,
            customerConfirmed=completed,
            code=f"DEMO-ARCHIVE-{i + 1}",
            courier=str(courier) if i < 8 else None,
            delivery="arrived" if i < 8 else "cancelled",
            eta=60,
            refunded=refunded,
            disputed=False,
            commission=commission,
            rate=300,
            created=stamp,
            seedRun=str(run),
            historical=True,
        )
        db.execute(
            "insert into private.commerce_records(id,kind,owner,stall,market,assigned,data,created_at) values(%s,'order',%s,%s,%s,%s,%s,%s) on conflict(id) do nothing",
            (
                order,
                owner,
                stable(stall["id"]),
                stable(stall["marketId"]),
                courier if i < 8 else None,
                json.dumps(data),
                stamp,
            ),
        )
        if completed:
            for kind, amount in [
                ("collection", total),
                ("refund", -refunded),
                ("commission", commission),
            ]:
                if amount:
                    db.execute(
                        "insert into private.commerce_ledger(id,order_id,kind,amount,at,event_key) values(%s,%s,%s,%s,%s,%s) on conflict(event_key) do nothing",
                        (
                            stable(f"{run}:ledger:{i}:{kind}"),
                            order,
                            kind,
                            amount,
                            stamp,
                            f"phase11:{run}:{i}:{kind}",
                        ),
                    )
    for i in range(8):
        stall = stalls[i]
        status = ["approved", "pending", "rejected", "paused"][i % 4]
        key = stable(f"{run}:campaign:{i}")
        data = dict(
            id=str(key),
            owner=str(advertiser),
            stall=str(stable(stall["id"])),
            market=str(stable(stall["marketId"])),
            category=stall["category"],
            radius=5,
            start=now.isoformat(),
            end=(now + timedelta(days=1)).isoformat(),
            budget=1000,
            spent=1000 if i == 4 else 105 if i == 0 else 0,
            status=status,
            approved=status in ["approved", "paused"],
            placement=["sponsored", "banner", "native", "interstitial"][i % 4],
            description=f"AD-{i % 6 + 1:02}: blank image placeholder; fictional advertisement",
            impressions=80 if i == 0 else 0,
            clicks=5 if i == 0 else 0,
            seedRun=str(run),
        )
        db.execute(
            "insert into private.commerce_records(id,kind,owner,stall,market,organisation,data) values(%s,'campaign',%s,%s,%s,%s,%s) on conflict(id) do nothing",
            (
                key,
                advertiser,
                stable(stall["id"]),
                stable(stall["marketId"]),
                stable("organisation-10"),
                json.dumps(data),
            ),
        )
    for i in range(8):
        db.execute(
            "insert into private.commerce_accounts(owner,tier,advertiser) values(%s,%s,%s) on conflict(owner) do nothing",
            (
                people[f"owner-{i + 1:02}"],
                ["free", "premium", "renewal-failed"][i % 3],
                json.dumps({"name": "Fictional advertiser", "business": "Demo stall"}),
            ),
        )
    groups = [
        ("mediaFeatures", "collaboration", 1),
        ("collaborations", "collaboration", 3),
        ("referrals", "case", 4),
        ("permits", "permit", 6),
        ("collections", "collection", 7),
        ("trails", "trail", 1),
    ]
    for group, kind, organisation in groups:
        for i, item in enumerate(catalog.get(group, [])):
            stall = stalls[i % len(stalls)]
            key = stable(f"{run}:{item['id']}")
            org = organisation + i % 3 if kind == "collection" else organisation
            owner = (
                people["phase11-admin"]
                if kind == "case"
                else people[f"owner-{i % 30 + 1:02}"]
            )
            data = dict(
                id=str(key),
                kind=kind,
                owner=str(owner),
                org=str(stable(f"organisation-{org}")),
                stall=str(stable(stall["id"])),
                market=str(stable(stall["marketId"])),
                status=item["status"],
                body=item["body"],
                created=stamp,
                expires=None,
                reference=f"DEMO-{group.upper()}-{i + 1}",
                seedRun=str(run),
                historical=True,
                scenario="fictional-seed; no external action",
            )
            if group == "mediaFeatures":
                data.update(status="published", public=True)
            if kind == "case":
                data.update(
                    consent=True, checklist=["handling", "storage"] if i < 4 else []
                )
            if kind == "permit":
                data["expires"] = (
                    now + timedelta(days=-1 if item["status"] == "expired" else 7)
                ).isoformat()
            if kind == "collection":
                data.update(
                    status=["collected", "missed", "cancelled"][i % 3],
                    route=["donation", "compost", "bsf"][i % 3],
                    batch=str(stable(f"{run}:archive-batch:{i % 24}")),
                    units=2,
                    estimatedGrams=300,
                    weighedGrams=280 if i % 3 == 0 else None,
                )
            if kind == "trail":
                data.update(
                    status="published",
                    public=True,
                    stops=[str(stable(s["id"])) for s in stalls[i * 3 : i * 3 + 3]],
                )
            db.execute(
                "insert into private.partner_records(id,kind,owner,org,stall,market,data,created_at) values(%s,%s,%s,%s,%s,%s,%s,%s) on conflict(id) do nothing",
                (
                    key,
                    kind,
                    owner,
                    stable(f"organisation-{org}"),
                    stable(stall["id"]),
                    stable(stall["marketId"]),
                    json.dumps(data),
                    stamp,
                ),
            )
            db.execute(
                "insert into private.partner_log(id,entry,kind,body,at) values(%s,%s,'synthetic-seed','Fictional history only; no messages, permits or authority referral sent',%s) on conflict(id) do nothing",
                (stable(f"{run}:partner-log:{item['id']}"), key, stamp),
            )
    for i, item in enumerate(catalog["complaints"]):
        stall = stalls[i % len(stalls)]
        reporter = people[f"shopper-{i + 1:02}"]
        key = stable(f"{run}:{item['id']}")
        db.execute(
            "insert into public.complaints(id,stall_id,reporter_id,body,status,request_id,source_scenario,approved_summary) values(%s,%s,%s,%s,%s,%s,'phase11',%s) on conflict(id) do nothing",
            (
                key,
                stable(stall["id"]),
                reporter,
                item["body"],
                item["status"]
                if item["status"] in ["submitted", "triaged", "dismissed", "escalated"]
                else "submitted",
                stable(f"{run}:report:{i}"),
                "Fictional demonstration report; no actual business allegation",
            ),
        )
        db.execute(
            "insert into private.community_audit(id,target,actor,kind,body) values(%s,%s,%s,'synthetic-seed','Private fictional report; no public flag or authority transmission') on conflict(id) do nothing",
            (stable(f"{run}:report-audit:{i}"), str(key), reporter),
        )


def finish_run(db, run):
    counts = {}
    for table in [
        "profiles",
        "markets",
        "stalls",
        "food_items",
        "reviews",
        "organisations",
        "complaints",
    ]:
        counts[table] = db.execute(
            f"select count(*) from public.{table} where source_scenario='phase11'"
        ).fetchone()[0]
    counts["catalog_batches"] = db.execute(
        "select count(*) from public.batches where source_scenario='phase11' and request_hash like %s",
        (f"phase11:{run}:%",),
    ).fetchone()[0]
    counts["historical_batches"] = db.execute(
        "select count(*) from public.batches where source_scenario='phase11-history' and request_hash like %s and remaining_quantity=0 and inventory_state='sold-out'",
        (f"phase11:{run}:%",),
    ).fetchone()[0]
    counts["orders"] = db.execute(
        "select count(*) from private.commerce_records where kind='order' and data->>'seedRun'=%s",
        (str(run),),
    ).fetchone()[0]
    counts["campaigns"] = db.execute(
        "select count(*) from private.commerce_records where kind='campaign' and data->>'seedRun'=%s",
        (str(run),),
    ).fetchone()[0]
    counts["partner_entries"] = db.execute(
        "select count(*) from private.partner_records where data->>'seedRun'=%s",
        (str(run),),
    ).fetchone()[0]
    if any(
        counts[k] != n
        for k, n in {
            "profiles": 99,
            "markets": 10,
            "stalls": 30,
            "food_items": 90,
            "reviews": 150,
            "organisations": 12,
            "catalog_batches": 150,
            "historical_batches": 24,
            "orders": 24,
            "campaigns": 8,
            "partner_entries": 39,
        }.items()
    ):
        raise ValueError("Connected catalog counts differ; transaction rolled back")
    db.execute(
        "update private.demo_seed_runs set completed_at=now(),counts=%s where id=%s",
        (json.dumps(counts), run),
    )
