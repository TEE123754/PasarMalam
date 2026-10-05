"""Scoped outbox dispatcher; explicit test push or internal simulation."""

import hmac
import logging
import time
from os import getenv
from typing import Annotated

import psycopg
from fastapi import APIRouter, Header, HTTPException

from .push import configured, send_test
from .weather import signed_weather, weather_payload

router = APIRouter(prefix="/api/v1/agent", tags=["agent"])
logger = logging.getLogger(__name__)


@router.post("/dispatch")
def dispatch(secret_header: Annotated[str | None, Header(alias="X-Agent-Secret")] = None):
    secret = getenv("AGENT_DISPATCH_SECRET", "")
    database = getenv("AGENT_DATABASE_URL", "")
    if len(secret) < 32 or not database or getenv("APP_ENV") != "demo":
        raise HTTPException(503, "Demo agent is not configured")
    if not hmac.compare_digest(secret_header or "", secret):
        raise HTTPException(403, "Agent signature required")
    if getenv("PUSH_MODE") == "enrolled-test" and not configured():
        raise HTTPException(503, "Test push configuration is incomplete")
    started = time.monotonic()
    try:
        with psycopg.connect(database, connect_timeout=5) as connection:
            if connection.execute("select current_user").fetchone()[0] != "pasarmalam_agent":
                raise HTTPException(503, "Agent requires its scoped database role")
            if (
                connection.execute("select public.agent_environment()").fetchone()[0]
                != "disposable-demo"
            ):
                raise HTTPException(503, "Agent requires a disposable environment")
            connection.execute("select private.closing_tick()")
            due = connection.execute("select private.weather_due()").fetchone()[0]
            connection.commit()
            failures = 0
            for market in due:
                try:
                    payload = weather_payload(
                        str(market["market"]), market["latitude"], market["longitude"]
                    )
                    body, signature = signed_weather(payload, secret)
                    connection.execute(
                        "select public.store_market_weather(%s,%s)", (body, signature)
                    )
                    connection.commit()
                except httpx_error_types():
                    connection.rollback()
                    failures += 1
            claims = connection.execute("select private.claim_dispatch()").fetchone()[0]
            connection.commit()
            results = []
            for claim in claims:
                if configured():
                    payload = connection.execute(
                        "select private.push_payload(%s,%s)", (claim["id"], claim["token"])
                    ).fetchone()[0]
                    outcome = send_test(payload) if payload else "suppressed"
                    result = connection.execute(
                        "select private.push_finish(%s,%s,%s,%s)",
                        (
                            claim["id"],
                            claim["token"],
                            outcome,
                            payload["subscription"]["endpoint"] if payload else "",
                        ),
                    ).fetchone()[0]
                    connection.commit()
                    results.append(result)
                    continue
                result = connection.execute(
                    "select private.finish_dispatch(%s,%s,true)", (claim["id"], claim["token"])
                ).fetchone()[0]
                connection.commit()
                results.append(result)
        duration = round((time.monotonic() - started) * 1000)
        logger.info(
            "Demo agent completed: weather_failures=%d claims=%d duration_ms=%d",
            failures,
            len(results),
            duration,
        )
        return {
            "transport": "test-push" if configured() else "simulated",
            "weather_failures": failures,
            "results": results,
            "duration_ms": duration,
        }
    except psycopg.Error as error:
        raise HTTPException(503, "Agent database unavailable") from error


def httpx_error_types():
    import httpx

    return (httpx.HTTPError, ValueError, KeyError, TypeError, psycopg.Error)
