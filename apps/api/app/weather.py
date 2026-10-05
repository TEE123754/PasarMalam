"""Bounded current-weather lookup; failures never become ideal-weather assumptions."""

import hashlib
import hmac
import json
import math
from datetime import datetime, timezone
from os import getenv

import httpx


def weather_payload(market: str, latitude: float, longitude: float) -> dict:
    now = datetime.now(timezone.utc)
    if getenv("WEATHER_MODE", "fixture") == "fixture":
        return {
            "market": market,
            "temperature": 28,
            "humidity": 75,
            "observed": now.isoformat(),
            "source": "fixture",
        }
    if getenv("WEATHER_MODE") != "open-meteo":
        raise ValueError("Unsupported weather mode")
    with httpx.Client(timeout=5, follow_redirects=False) as client:
        response = client.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,relative_humidity_2m",
                "timezone": "UTC",
            },
        )
        response.raise_for_status()
        current = response.json()["current"]
    temperature = float(current["temperature_2m"])
    humidity = float(current["relative_humidity_2m"])
    observed = datetime.fromisoformat(current["time"]).replace(tzinfo=timezone.utc)
    if not (
        math.isfinite(temperature)
        and -20 <= temperature <= 60
        and math.isfinite(humidity)
        and 0 <= humidity <= 100
        and -300 <= (now - observed).total_seconds() <= 1800
    ):
        raise ValueError("Invalid or stale provider observation")
    return {
        "market": market,
        "temperature": temperature,
        "humidity": humidity,
        "observed": observed.isoformat(),
        "source": "open-meteo",
    }


def signed_weather(payload: dict, secret: str) -> tuple[str, str]:
    body = json.dumps(payload, separators=(",", ":"), allow_nan=False)
    signature = hmac.new(secret.encode(), ("weather:" + body).encode(), hashlib.sha256)
    return body, signature.hexdigest()
