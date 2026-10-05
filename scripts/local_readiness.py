"""Read-only provider readiness. Never prints credentials or provider response bodies."""

import json
import os
from pathlib import Path

import httpx
import psycopg
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "apps/api/.env")


def inspect():
    result = {}
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    with httpx.Client(timeout=15, follow_redirects=False) as client:
        for name, path in [("supabase_jwks", "/auth/v1/.well-known/jwks.json")]:
            try:
                r = client.get(url + path)
                result[name] = r.status_code
            except httpx.HTTPError:
                result[name] = "unreachable"
        try:
            r = client.get(
                url + "/rest/v1/markets?select=id&limit=1",
                headers={"apikey": os.getenv("SUPABASE_PUBLISHABLE_KEY", "")},
            )
            result["supabase_markets"] = r.status_code
        except httpx.HTTPError:
            result["supabase_markets"] = "unreachable"
        key = os.getenv("MORPHEUS_API_KEY", "")
        if key:
            try:
                r = client.get(
                    "https://api.mor.org/api/v1/models",
                    headers={"Authorization": "Bearer " + key},
                )
                result["morpheus_models_status"] = r.status_code
                if r.is_success:
                    rows = r.json()
                    if isinstance(rows, dict):
                        rows = rows.get("data", [])
                    ids = [x.get("id") for x in rows if isinstance(x, dict)]
                    result["selected_model_available"] = os.getenv("MORPHEUS_MODEL") in ids
            except (httpx.HTTPError, ValueError, TypeError):
                result["morpheus_models_status"] = "unreachable"
    try:
        with psycopg.connect(os.getenv("DATABASE_URL", ""), connect_timeout=10) as db:
            result["database"] = "connected"
            result["guard_present"] = bool(
                db.execute(
                    "select to_regclass('private.environment_guard')"
                ).fetchone()[0]
            )
            result["public_tables"] = db.execute(
                "select count(*) from pg_tables where schemaname='public'"
            ).fetchone()[0]
            result["auth_accounts"] = db.execute(
                "select count(*) from auth.users"
            ).fetchone()[0]
    except psycopg.Error:
        result["database"] = "unreachable; verify connection endpoint/password/network"
    output = json.dumps(result, indent=2) + "\n"
    (ROOT / "docs/local-service-readiness.json").write_text(output, encoding="utf-8")
    print(output)


if __name__ == "__main__":
    inspect()
