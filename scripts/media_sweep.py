"""Guarded sweep: expired incomplete or explicitly abandoned, never unresolved ready tickets."""

import argparse
import os

import httpx
import psycopg
from demo_db import target_configuration, verify_marker


def sweep(apply=False):
    _, url, database = target_configuration()
    secret = os.getenv("SUPABASE_SECRET_KEY", "")
    if apply and not secret:
        raise ValueError("Operator Storage credential required")
    headers = {"apikey": secret}
    if not secret.startswith("sb_secret_"):
        headers["Authorization"] = "Bearer " + secret
    removed = 0
    with psycopg.connect(database) as connection:
        verify_marker(connection)
        candidates = connection.execute(
            "select object_key,actor_id from private.listing_uploads "
            "where not attached and ((not ready and expires_at<now()-interval '1 hour') "
            "or abandoned_at<now()-interval '1 hour') limit 20"
        ).fetchall()
        connection.commit()
        for key, actor in candidates:
            with connection.transaction():
                if not connection.execute(
                    "select id from public.profiles where id=%s for update skip locked",
                    (actor,),
                ).fetchone():
                    continue
                ticket = connection.execute(
                    "select object_key from private.listing_uploads where object_key=%s and not attached "
                    "and ((not ready and expires_at<now()-interval '1 hour') or abandoned_at<now()-interval '1 hour') for update skip locked",
                    (key,),
                ).fetchone()
                attached = connection.execute(
                    "select exists(select 1 from public.batches where photo=%s union all select 1 from public.food_items where photo=%s union all select 1 from public.stalls where photo=%s)",
                    (key, key, key),
                ).fetchone()[0]
                if not ticket or attached or not apply:
                    continue
                try:
                    with httpx.Client(timeout=10, follow_redirects=False) as client:
                        response = client.request(
                            "DELETE",
                            url + "/storage/v1/object/listing-media",
                            headers=headers,
                            json={"prefixes": [key]},
                        )
                except httpx.HTTPError:
                    connection.execute(
                        "insert into private.agent_runs values(gen_random_uuid(),'media-sweep-retry',now(),0,'{}')"
                    )
                    continue
                if response.status_code not in {200, 404}:
                    connection.execute(
                        "insert into private.agent_runs values(gen_random_uuid(),'media-sweep-retry',now(),0,'{}')"
                    )
                    continue
                connection.execute(
                    "delete from private.listing_uploads where object_key=%s", (key,)
                )
                removed += 1
        if apply:
            connection.execute(
                "insert into private.agent_runs values(gen_random_uuid(),'media-sweep',now(),0,jsonb_build_object('removed',%s))",
                (removed,),
            )
    print(
        f"Sweep candidates={len(candidates)} removed={removed} apply={apply}; unresolved ready tickets retained."
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    sweep(parser.parse_args().apply)
