"""Guarded complete connected catalog. Retire old runs without rewinding batch history."""

import argparse
import json
import os
from datetime import timedelta
from uuid import NAMESPACE_DNS, uuid5

import demo_seed
import psycopg
from connected_seed import finish_run, seed_workflows, start_run
from demo_db import ROOT, target_configuration, verify_marker


def stable(key):
    return uuid5(NAMESPACE_DNS, "pasarmalam.demo.phase11." + key)


def plan(catalog):
    people = {
        f"owner-{i + 1:02}": (r["name"], "vendor")
        for i, r in enumerate(catalog["owners"])
    }
    people.update(
        {
            f"shopper-{i + 1:02}": (r["name"], "customer")
            for i, r in enumerate(catalog["customers"])
        }
    )
    people["phase11-admin"] = ("Private fictional moderator", "admin")
    for i in range(18):
        people[f"partner-{i + 1:02}"] = (
            f"Fictional partner {i + 1}",
            "organiser" if i in [5, 17] else "partner",
        )
    return people


def seed(reset=False):
    _, url, database = target_configuration()
    catalog = json.loads(
        (ROOT / "contracts/demo-catalog.json").read_text(encoding="utf-8")
    )
    d = catalog["discovery"]
    with psycopg.connect(database, connect_timeout=10) as db:
        verify_marker(db)
        db.execute("select pg_advisory_xact_lock(517011)")
        # Match inspector food-before-batch ordering before retiring existing stock.
        db.execute(
            "select id from public.food_items where source_scenario='phase11' "
            "order by id for update"
        ).fetchall()
        run, now, completed = start_run(db, catalog, reset)
        if completed:
            print(
                "Current catalog already complete; no records or batch timestamps changed."
            )
            return
        # Provision uses protected bindings and confirmed .invalid identities without email.
        identities = demo_seed.provision(db, url, plan(catalog))
        for key, (name, role) in plan(catalog).items():
            db.execute(
                "insert into public.profiles(id,display_name,verified_at,source_scenario) values(%s,%s,now(),'phase11') on conflict(id) do nothing",
                (identities[key], name),
            )
            db.execute(
                "insert into public.user_roles values(%s,%s) on conflict do nothing",
                (identities[key], role),
            )
        for m in d["markets"]:
            db.execute(
                "insert into public.markets(id,name,area,type,location,display_hours,display_days,published,source_scenario) values(%s,%s,%s,%s,extensions.st_setsrid(extensions.st_makepoint(%s,%s),4326)::extensions.geography,%s,%s,true,'phase11') on conflict(id) do nothing",
                (
                    stable(m["id"]),
                    m["name"],
                    m["area"],
                    m["type"],
                    m["longitude"],
                    m["latitude"],
                    m["hours"],
                    m["days"],
                ),
            )
            for i, s in enumerate(m["schedules"]):
                db.execute(
                    "insert into public.market_schedules(id,market_id,weekday,opens_at,closes_at,closes_next_day,source_scenario) values(%s,%s,%s,%s,%s,%s,'phase11') on conflict do nothing",
                    (
                        stable(f"schedule:{m['id']}:{i}"),
                        stable(m["id"]),
                        s["weekday"],
                        s["opens"],
                        s["closes"],
                        s["nextDay"],
                    ),
                )
        for i, s in enumerate(d["stalls"]):
            db.execute(
                "insert into public.stalls(id,market_id,name,category,specialty,price_sen,halal,open,published,lot,opens,closes,source_scenario) values(%s,%s,%s,%s,%s,%s,%s,%s,true,%s,%s,%s,'phase11') on conflict(id) do nothing",
                (
                    stable(s["id"]),
                    stable(s["marketId"]),
                    s["name"],
                    s["category"],
                    s["specialty"],
                    s["priceSen"],
                    s["halal"],
                    s["open"],
                    s.get("lot", ""),
                    s.get("opens", "17:00"),
                    s.get("closes", "22:30"),
                ),
            )
            db.execute(
                "insert into public.stall_memberships values(%s,%s,'owner') on conflict do nothing",
                (stable(s["id"]), identities[f"owner-{i + 1:02}"]),
            )
        for f in d["menu"]:
            db.execute(
                "insert into public.food_items(id,stall_id,name,price_sen,ingredients,published,source_scenario) values(%s,%s,%s,%s,%s,true,'phase11') on conflict(id) do nothing",
                (
                    stable(f["id"]),
                    stable(f["stallId"]),
                    f["name"],
                    f["priceSen"],
                    f["ingredients"],
                ),
            )
        for r in catalog["reviews"]:
            shopper = "shopper-" + r["author"].split("-")[-1]
            db.execute(
                "insert into public.reviews(id,stall_id,customer_id,rating,body,status,source_scenario) values(%s,%s,%s,%s,%s,'published','phase11') on conflict do nothing",
                (
                    stable(r["id"]),
                    stable(r["stallId"]),
                    identities[shopper],
                    r["rating"],
                    r["body"],
                ),
            )
        # Synthetic weather is labelled; current runtime weather subsequently tightens windows.
        for m in d["markets"]:
            db.execute(
                "insert into public.weather_snapshots(id,market_id,temperature_c,humidity_pct,observed_at,provider,synthetic,status,source_scenario) values(%s,%s,28,75,%s,'fixture',true,'valid','phase11') on conflict(id) do nothing",
                (stable(f"{run}:weather:{m['id']}"), stable(m["id"]), now),
            )
        for b in catalog["batches"]:
            # Leave proposed active batches needs-information until guarded advisory confirmation.
            status = (
                b["status"]
                if b["status"] in ["discarded", "sold-out"]
                else "needs-information"
            )
            batch_id = stable(f"{run}:{b['id']}")
            db.execute(
                "select id from public.food_items where id=%s for update",
                (stable(b["food"]),),
            )
            inserted = db.execute(
                "insert into public.batches(id,food_item_id,batch_number,prepared_at,original_quantity,remaining_quantity,handling,status,inventory_state,request_id,request_hash,source_scenario) select %s,id,next_batch_number,%s,%s,%s,%s,%s,%s,%s,%s,'phase11' from public.food_items where id=%s on conflict(id) do nothing returning id",
                (
                    batch_id,
                    now - timedelta(minutes=b["ageMinutes"]),
                    max(20, b["quantity"]),
                    b["quantity"],
                    json.dumps(
                        {
                            "storage": b["storage"],
                            "note": "Fictional seed; confirm advisory before clearance",
                        }
                    ),
                    status,
                    status if status in ["discarded", "sold-out"] else "available",
                    stable(f"{run}:request:{b['id']}"),
                    f"phase11:{run}:{b['id']}",
                    stable(b["food"]),
                ),
            ).fetchone()
            if inserted:
                db.execute(
                    "update public.food_items set next_batch_number=next_batch_number+1 where id=%s",
                    (stable(b["food"]),),
                )
                food = next(f for f in d["menu"] if f["id"] == b["food"])
                index = next(
                    i for i, s in enumerate(d["stalls"]) if s["id"] == food["stallId"]
                )
                actor = identities[f"owner-{index + 1:02}"]
                db.execute(
                    "select set_config('request.jwt.claims',%s,true)",
                    (json.dumps({"sub": str(actor), "role": "authenticated"}),),
                )
                db.execute(
                    "insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(%s,%s,'synthetic-seed',%s,%s)",
                    (
                        batch_id,
                        actor,
                        stable(f"{run}:audit:{b['id']}"),
                        json.dumps(
                            {
                                "run": str(run),
                                "catalog_batch": b["id"],
                                "fictional": True,
                                "original_prepared_at": (
                                    now - timedelta(minutes=b["ageMinutes"])
                                ).isoformat(),
                            }
                        ),
                    ),
                )
                if b["confirmed"] and status == "needs-information":
                    db.execute(
                        "select public.confirm_advisory(%s,%s,true,%s,%s)",
                        (
                            batch_id,
                            food["ingredients"],
                            b["storage"] == "ambient",
                            stable(f"{run}:declaration:{b['id']}"),
                        ),
                    )
        db.execute(
            "update public.food_items f set next_batch_number=greatest(f.next_batch_number,coalesce((select max(b.batch_number)+1 from public.batches b where b.food_item_id=f.id),1)) where f.source_scenario='phase11'"
        )
        eligible = db.execute(
            "select b.id,f.stall_id from public.batches b join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id where b.request_hash like %s and b.status='active' and b.remaining_quantity>=4 and private.effective_deadline(b.id)>private.clock_now()+interval '15 minutes' and private.market_close(s.market_id)>private.clock_now() and s.open order by b.id limit 12",
            (f"phase11:{run}:%",),
        ).fetchall()
        for i, (batch, stall_id) in enumerate(eligible):
            index = next(
                i for i, s in enumerate(d["stalls"]) if stable(s["id"]) == stall_id
            )
            actor = identities[f"owner-{index + 1:02}"]
            db.execute(
                "select set_config('request.jwt.claims',%s,true)",
                (json.dumps({"sub": str(actor), "role": "authenticated"}),),
            )
            db.execute(
                "select public.publish_clearance(%s,%s,%s,4,%s,%s)",
                (
                    batch,
                    ["free", "bogo", "percentage"][i % 3],
                    25 if i % 3 == 2 else 0,
                    f"DEMO confirmed clearance {i + 1}",
                    stable(f"{run}:clearance:{batch}"),
                ),
            )
        kinds = [
            "media",
            "media",
            "advertiser",
            "authority",
            "authority",
            "council",
            "charity",
            "waste",
            "waste",
            "advertiser",
            "delivery",
            "advertiser",
        ]
        for i, kind in enumerate(kinds):
            org = stable(f"organisation-{i + 1}")
            db.execute(
                "insert into public.organisations(id,name,kind,source_scenario) values(%s,%s,%s,'phase11') on conflict do nothing",
                (org, f"Fictional {kind} team {i + 1}", kind),
            )
        for i in range(18):
            db.execute(
                "insert into public.organisation_members values(%s,%s,'member') on conflict do nothing",
                (
                    stable(f"organisation-{i % 12 + 1}"),
                    identities[f"partner-{i + 1:02}"],
                ),
            )
            if i in [5, 17]:
                db.execute(
                    "insert into public.organiser_memberships values(%s,%s) on conflict do nothing",
                    (
                        stable(d["markets"][0 if i == 5 else 1]["id"]),
                        identities[f"partner-{i + 1:02}"],
                    ),
                )
        seed_workflows(db, catalog, identities, run, now, stable)
        finish_run(db, run)
    print(
        "Complete fictional catalog provisioned. Eligibility comes from SQL rules; previous timestamps/audits retained."
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--reset-to-today",
        action="store_true",
        help="Retire current demo run and create new batches; preserve all previous audit history",
    )
    if len(os.getenv("DEMO_SEED_PASSWORD", "")) < 16:
        raise SystemExit(
            "Configure a private seed password of at least 16 characters first."
        )
    try:
        seed(parser.parse_args().reset_to_today)
    except Exception:
        raise SystemExit(
            "Guarded core seed unavailable; inspect connection/migrations privately."
        ) from None
