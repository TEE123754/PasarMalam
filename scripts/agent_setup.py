"""Explicit guarded configuration; never executed automatically on API startup."""

import os
from urllib.parse import urlparse

import psycopg
from demo_db import target_configuration, verify_marker
from psycopg import sql


def main():
    _, _, database = target_configuration()
    secret = os.getenv("AGENT_DISPATCH_SECRET", "")
    password = os.getenv("AGENT_DATABASE_PASSWORD", "")
    url = os.getenv("AGENT_DISPATCH_URL", "")
    parsed = urlparse(url)
    if len(secret) < 32 or len(password) < 32:
        raise ValueError(
            "Configure separate agent secret and database password (32+ characters)"
        )
    if not (
        parsed.scheme == "https"
        and (parsed.hostname or "").endswith(".up.railway.app")
        and parsed.path == "/api/v1/agent/dispatch"
        and not parsed.query
        and not parsed.fragment
        and not parsed.username
    ):
        raise ValueError("Set the explicit Railway HTTPS dispatcher URL")
    with psycopg.connect(database) as connection:
        verify_marker(connection)
        connection.execute(
            "insert into private.agent_config(singleton,secret,dispatch_url) "
            "values(true,%s,%s) on conflict(singleton) do update "
            "set secret=excluded.secret,dispatch_url=excluded.dispatch_url",
            (secret, url),
        )
        connection.execute(
            sql.SQL("alter role pasarmalam_agent login password {}").format(
                sql.Literal(password)
            )
        )
        connection.execute("create extension if not exists pg_cron")
        connection.execute("create extension if not exists pg_net")
        connection.execute(
            "select cron.schedule('pasarmalam-closing-agent','* * * * *',"
            "'select private.scheduled_agent()')"
        )
    print(
        "Scoped role and minute-level job configured; perform Phase 5 live acceptance next."
    )


if __name__ == "__main__":
    main()
