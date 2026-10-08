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
    local = parsed.scheme == "http" and parsed.hostname in {"127.0.0.1", "localhost"}
    hosted = parsed.scheme == "https" and (parsed.hostname or "").endswith(
        ".up.railway.app"
    )
    if not (
        (local or hosted)
        and parsed.path == "/api/v1/agent/dispatch"
        and not parsed.query
        and not parsed.fragment
        and not parsed.username
        and not parsed.password
    ):
        raise ValueError(
            "Use a loopback local dispatcher or the explicit Railway HTTPS URL"
        )
    with psycopg.connect(database, connect_timeout=10) as connection:
        verify_marker(connection)
        connection.execute(
            "insert into private.agent_config(singleton,secret,dispatch_url) "
            "values(true,%s,%s) on conflict(singleton) do update "
            "set secret=excluded.secret,dispatch_url=excluded.dispatch_url",
            (secret, None if local else url),
        )
        connection.execute(
            sql.SQL("alter role pasarmalam_agent login password {}").format(
                sql.Literal(password)
            )
        )
        connection.execute("create extension if not exists pg_cron")
        if not local:
            connection.execute("create extension if not exists pg_net")
        connection.execute(
            "select cron.schedule('pasarmalam-closing-agent','* * * * *',"
            "'select private.scheduled_agent()')"
        )
    print(
        "Scoped role and minute-level SQL tick configured. "
        + (
            "Start the local worker for dispatch and hourly media cleanup."
            if local
            else "Hosted wake configured."
        )
    )


if __name__ == "__main__":
    main()
