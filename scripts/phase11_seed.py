"""Guarded connected core catalog. No reset/deletion or invented safety eligibility."""

import json
import os
from datetime import datetime, timedelta, timezone
from uuid import NAMESPACE_DNS, uuid5

import demo_seed
import psycopg
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


def seed():
    _, url, database = target_configuration()
    catalog = json.loads(
        (ROOT / "contracts/demo-catalog.json").read_text(encoding="utf-8")
    )
    d = catalog["discovery"]
    with psycopg.connect(database, connect_timeout=10) as db:
        verify_marker(db)
        # Provision uses protected bindings and confirmed .invalid identities without email.
        original = demo_seed.PERSONAS
        demo_seed.PERSONAS = plan(catalog)
        try:
            identities = demo_seed.provision(db, url)
        finally:
            demo_seed.PERSONAS = original
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
        now = datetime.now(timezone.utc)
        for b in catalog["batches"]:
            # Leave proposed active batches needs-information until guarded advisory confirmation.
            status = (
                b["status"]
                if b["status"] in ["discarded", "sold-out"]
                else "needs-information"
            )
            db.execute(
                "insert into public.batches(id,food_item_id,batch_number,prepared_at,original_quantity,remaining_quantity,handling,status,request_id,request_hash,source_scenario) values(%s,%s,%s,%s,20,%s,%s,%s,%s,%s,'phase11') on conflict do nothing",
                (
                    stable(b["id"]),
                    stable(b["food"]),
                    b["number"],
                    now - timedelta(minutes=b["ageMinutes"]),
                    b["quantity"],
                    json.dumps(
                        {
                            "storage": b["storage"],
                            "note": "Fictional seed; confirm advisory before clearance",
                        }
                    ),
                    status,
                    stable("request:" + b["id"]),
                    "phase11:" + b["id"],
                ),
            )
        db.execute(
            "update public.food_items f set next_batch_number=greatest(f.next_batch_number,coalesce((select max(b.batch_number)+1 from public.batches b where b.food_item_id=f.id),1)) where f.source_scenario='phase11'"
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
    print(
        "Core Phase 11 catalog provisioned. Advisory eligibility and full workflow history still require acceptance; no timers reset."
    )


if __name__ == "__main__":
    if len(os.getenv("DEMO_SEED_PASSWORD", "")) < 16:
        raise SystemExit(
            "Configure a private seed password of at least 16 characters first."
        )
    try:
        seed()
    except Exception:
        raise SystemExit(
            "Guarded core seed unavailable; inspect connection/migrations privately."
        ) from None
