"""Guard operator operations against arbitrary/production database URLs."""

import argparse
import hashlib
import os
import re
from pathlib import Path
from urllib.parse import unquote, urlparse
from uuid import UUID

import psycopg
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "apps/api/.env")


def target_configuration() -> tuple[str, str, str]:
    if os.getenv("APP_ENV") != "demo":
        raise ValueError("Operator commands require APP_ENV=demo")
    ref = os.getenv("DEMO_PROJECT_REF", "")
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    database = os.getenv("DATABASE_URL", "")
    api, db = urlparse(url), urlparse(database)
    if db.scheme not in {"postgres", "postgresql"} or db.path != "/postgres":
        raise ValueError("A configured disposable Supabase postgres database is required")
    if ref == "local":
        valid_api = (
            api.scheme == "http"
            and api.hostname in {"localhost", "127.0.0.1"}
            and api.port == 54321
        )
        valid_db = db.hostname in {"localhost", "127.0.0.1"} and db.port == 54322
    else:
        valid_api = bool(re.fullmatch(r"[a-z0-9]{20}", ref)) and url == f"https://{ref}.supabase.co"
        valid_db = db.hostname == f"db.{ref}.supabase.co" or (
            (db.hostname or "").endswith(".pooler.supabase.com")
            and unquote(db.username or "") == f"postgres.{ref}"
        )
    if not valid_api or not valid_db or api.username or api.password or api.query or api.fragment:
        raise ValueError("API and database must match the explicitly configured demo target")
    if db.query and any(
        key not in {"sslmode"} for key in [p.split("=", 1)[0] for p in db.query.split("&")]
    ):
        raise ValueError("Unexpected database connection options")
    return ref, url, database


def verify_marker(connection: psycopg.Connection) -> None:
    expected = os.getenv("DEMO_DATABASE_ID", "")
    try:
        expected_id = UUID(expected)
    except ValueError as error:
        raise ValueError("Set DEMO_DATABASE_ID to the disposable database's guard UUID") from error
    row = connection.execute("select id,product,mode from private.environment_guard").fetchone()
    if row != (expected_id, "pasarmalam", "disposable-demo"):
        raise ValueError("Database guard does not match; refusing operator operation")


def migrate(initialise: bool = False) -> None:
    _, _, database = target_configuration()
    with psycopg.connect(database, autocommit=True, connect_timeout=10) as connection:
        marker = connection.execute("select to_regclass('private.environment_guard')").fetchone()[0]
        if marker:
            verify_marker(connection)
        elif not initialise:
            raise ValueError("Fresh database needs explicit --initialise")
        elif (
            connection.execute(
                "select count(*) from pg_tables where schemaname='public'"
            ).fetchone()[0]
            or connection.execute("select count(*) from auth.users").fetchone()[0]
        ):
            raise ValueError(
                "Initialisation requires an empty disposable application/auth database"
            )
        for file in sorted((ROOT / "supabase/migrations").glob("*.sql")):
            exists = connection.execute(
                "select to_regclass('private.schema_migrations')"
            ).fetchone()[0]
            text = file.read_text(encoding="utf-8")
            checksum = hashlib.sha256(text.encode()).hexdigest()
            previous = (
                connection.execute(
                    "select checksum from private.schema_migrations where version=%s", (file.name,)
                ).fetchone()
                if exists
                else None
            )
            if previous:
                if previous[0] != checksum:
                    raise ValueError("Applied migration changed; create a new migration instead")
                continue
            # All files own a single outer transaction; use one transaction for SQL + checksum.
            text = re.sub(r"(?mi)^begin;\s*$|^commit;\s*$", "", text)
            with connection.transaction():
                connection.execute(text, prepare=False)
                connection.execute(
                    "create table if not exists private.schema_migrations(version text primary key,checksum text not null,applied_at timestamptz not null default now())"
                )
                connection.execute(
                    "insert into private.schema_migrations(version,checksum) values(%s,%s)",
                    (file.name, checksum),
                )
            print(f"Applied {file.name}")
        if not marker:
            guard = connection.execute("select id from private.environment_guard").fetchone()[0]
            print(f"Set DEMO_DATABASE_ID={guard} in the ignored operator environment file.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--initialise", action="store_true")
    args = parser.parse_args()
    try:
        migrate(args.initialise)
    except Exception as error:
        # Connection exceptions can embed credentials; only our guard messages are printable.
        print(
            str(error)
            if isinstance(error, ValueError)
            else "Migration failed; check the disposable database locally."
        )
        raise SystemExit(1) from None
