"""Idempotent five-account seed; optional reset touches only Phase 2 business fixtures."""

import argparse
import os
from uuid import NAMESPACE_DNS, UUID, uuid5

import httpx
import psycopg
from demo_db import target_configuration, verify_marker

PERSONAS = {
    "vendor-a": ("Aina Demo", "vendor"),
    "vendor-b": ("Bala Demo", "vendor"),
    "customer-a": ("Mira Demo", "customer"),
    "customer-b": ("Danial Demo", "customer"),
    "admin": ("Private Demo Moderator", "admin"),
}


def stable(name: str) -> UUID:
    return uuid5(NAMESPACE_DNS, f"pasarmalam.demo.phase2.{name}")


def provision(connection: psycopg.Connection, url: str) -> dict[str, UUID]:
    secret = os.getenv("SUPABASE_SECRET_KEY", "")
    password = os.getenv("DEMO_SEED_PASSWORD", "")
    if not secret or len(password) < 16:
        raise ValueError(
            "Set operator-only secret key and a seed password of at least 16 characters"
        )
    identities = {}
    with httpx.Client(timeout=15, follow_redirects=False) as client:
        for key, (name, _) in PERSONAS.items():
            email = f"{key}@pasarmalam.invalid"
            row = connection.execute(
                "select id from auth.users where email=%s", (email,)
            ).fetchone()
            if row:
                user_id = row[0]
            else:
                headers = {"apikey": secret}
                if not secret.startswith("sb_secret_"):
                    headers["Authorization"] = f"Bearer {secret}"
                response = client.post(
                    f"{url}/auth/v1/admin/users",
                    headers=headers,
                    json={
                        "email": email,
                        "password": password,
                        "email_confirm": True,
                        "user_metadata": {"display_name": name, "is_demo": True},
                    },
                )
                if response.is_error:
                    raise ValueError(
                        "Auth provisioning failed; inspect the local provider dashboard"
                    )
                user_id = UUID(response.json()["id"])
            previous = connection.execute(
                "select user_id from private.demo_identity_map where persona=%s", (key,)
            ).fetchone()
            if previous and previous[0] != user_id:
                raise ValueError("Seed identity changed; refusing to reassign existing ownership")
            connection.execute(
                "insert into private.demo_identity_map(persona,user_id) values(%s,%s) on conflict(persona) do nothing",
                (key, user_id),
            )
            identities[key] = user_id
    return identities


def seed(reset: bool = False) -> dict[str, UUID]:
    _, url, database = target_configuration()
    with psycopg.connect(database) as connection:
        verify_marker(connection)
        identities = provision(connection, url)
        # No auth deletion, schema reset or truncate. Reject reset once live journeys exist.
        if reset:
            if (
                connection.execute("select count(*) from public.batches").fetchone()[0]
                or connection.execute("select count(*) from public.complaints").fetchone()[0]
            ):
                raise ValueError("Reset refuses batches/reports; preserve their audit history")
            for table in ("reviews", "food_items", "stalls", "markets"):
                # Memberships/schedules are removed explicitly; restrictive future FKs stop unsafe resets.
                if table == "stalls":
                    connection.execute(
                        "delete from public.stall_memberships where stall_id in (%s,%s)",
                        (stable("stall-a"), stable("stall-b")),
                    )
                if table == "markets":
                    connection.execute(
                        "delete from public.market_schedules where market_id in (%s,%s)",
                        (stable("market-a"), stable("market-b")),
                    )
                keys = {
                    "reviews": ["review-a", "review-b"],
                    "food_items": ["food-a", "food-b", "food-c"],
                    "stalls": ["stall-a", "stall-b"],
                    "markets": ["market-a", "market-b"],
                }[table]
                connection.execute(
                    f"delete from public.{table} where source_scenario='phase2' and id=any(%s)",
                    ([stable(key) for key in keys],),
                )
        for key, (name, role) in PERSONAS.items():
            connection.execute(
                "insert into public.profiles(id,display_name,verified_at) values(%s,%s,now()) on conflict(id) do nothing",
                (identities[key], name),
            )
            connection.execute(
                "insert into public.user_roles(user_id,role) values(%s,%s) on conflict do nothing",
                (identities[key], role),
            )
        markets = [
            (
                "market-a",
                "Seri Pelita",
                "Petaling Jaya",
                "night",
                101.61,
                3.10,
                "5:00 PM – 10:30 PM",
                "Every Friday",
                "open",
            ),
            (
                "market-b",
                "Pagi Embun",
                "Shah Alam",
                "day",
                101.53,
                3.07,
                "7:00 AM – 12:00 PM",
                "Every Saturday",
                "upcoming",
            ),
        ]
        for key, name, area, kind, lon, lat, hours, days, status in markets:
            connection.execute(
                "insert into public.markets(id,name,area,type,location,display_hours,display_days,status,published) values(%s,%s,%s,%s,extensions.st_setsrid(extensions.st_makepoint(%s,%s),4326)::extensions.geography,%s,%s,%s,true) on conflict(id) do nothing",
                (stable(key), name, area, kind, lon, lat, hours, days, status),
            )
        for category, en, ms in [
            ("skewers", "Skewers", "Sate"),
            ("rice", "Rice and noodles", "Nasi dan mi"),
        ]:
            connection.execute(
                "insert into public.categories values(%s,%s,%s) on conflict do nothing",
                (category, en, ms),
            )
        for key, market, day, opens, closes in [
            ("schedule-a", "market-a", 5, "17:00", "22:30"),
            ("schedule-b", "market-b", 6, "07:00", "12:00"),
        ]:
            connection.execute(
                "insert into public.market_schedules(id,market_id,weekday,opens_at,closes_at) values(%s,%s,%s,%s,%s) on conflict(id) do nothing",
                (stable(key), stable(market), day, opens, closes),
            )
        for key, market, name, category, specialty, price, owner in [
            ("stall-a", "market-a", "Bara Senja", "Skewers", "Chicken satay", 600, "vendor-a"),
            (
                "stall-b",
                "market-b",
                "Dapur Embun",
                "Rice and noodles",
                "Nasi lemak ayam",
                750,
                "vendor-b",
            ),
        ]:
            connection.execute(
                "insert into public.stalls(id,market_id,name,category,specialty,price_sen,halal,open,published) values(%s,%s,%s,%s,%s,%s,'declared',true,true) on conflict(id) do nothing",
                (stable(key), stable(market), name, category, specialty, price),
            )
            connection.execute(
                "insert into public.stall_memberships values(%s,%s,'owner') on conflict do nothing",
                (stable(key), identities[owner]),
            )
        for key, stall, category, name, price, ingredients in [
            ("food-a", "stall-a", "skewers", "Chicken satay", 600, ["chicken", "peanuts"]),
            ("food-b", "stall-b", "rice", "Nasi lemak ayam", 750, ["rice", "chicken", "coconut"]),
            ("food-c", "stall-b", "rice", "Mee goreng", 650, ["noodles", "egg"]),
        ]:
            connection.execute(
                "insert into public.food_items(id,stall_id,category_id,name,price_sen,ingredients,published) values(%s,%s,%s,%s,%s,%s,true) on conflict(id) do nothing",
                (stable(key), stable(stall), category, name, price, ingredients),
            )
        for key, customer, stall in [
            ("review-a", "customer-a", "stall-a"),
            ("review-b", "customer-b", "stall-b"),
        ]:
            connection.execute(
                "insert into public.reviews(id,stall_id,customer_id,rating,body,status) values(%s,%s,%s,4,'Fictional demo review','published') on conflict(id) do nothing",
                (stable(key), stable(stall), identities[customer]),
            )
        # Two fictional organisations exercise isolation without adding more Auth accounts.
        for key, kind, vendor in [("org-a", "media", "vendor-a"), ("org-b", "council", "vendor-b")]:
            connection.execute(
                "insert into public.organisations(id,name,kind) values(%s,%s,%s) on conflict do nothing",
                (stable(key), f"Fictional {kind} team", kind),
            )
            connection.execute(
                "insert into public.organisation_members values(%s,%s,'member') on conflict do nothing",
                (stable(key), identities[vendor]),
            )
        connection.commit()
    return identities


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    try:
        seed(args.reset)
        print("Demo seed complete: five account bindings, two markets, two stalls, three items.")
    except Exception as error:
        print(
            str(error)
            if isinstance(error, ValueError)
            else "Seed failed; inspect the disposable database locally."
        )
        raise SystemExit(1) from None
