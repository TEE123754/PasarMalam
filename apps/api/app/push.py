"""Explicitly opted-in technical Web Push; SMS/email remain simulated."""

import base64
import json
from os import getenv
from urllib.parse import urlsplit

import requests
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pywebpush import WebPushException, webpush

from .routes import Member

router = APIRouter(prefix="/api/v1/push", tags=["test-push"])
HOSTS = {"fcm.googleapis.com", "updates.push.services.mozilla.com", "web.push.apple.com"}


def valid_endpoint(value: str) -> str:
    parsed = urlsplit(value)
    if (
        parsed.scheme != "https"
        or parsed.hostname not in HOSTS
        or parsed.port not in (None, 443)
        or parsed.username
        or parsed.password
        or parsed.fragment
        or not parsed.path
        or len(value) > 2000
    ):
        raise ValueError("Unsupported test push endpoint")
    return value


def decode(value: str) -> bytes:
    return base64.b64decode(value + "=" * (-len(value) % 4), altchars=b"-_", validate=True)


class Subscription(BaseModel):
    model_config = ConfigDict(extra="forbid")
    endpoint: str
    p256dh: str = Field(min_length=80, max_length=100)
    auth: str = Field(min_length=20, max_length=30)
    consent: bool = Field(strict=True)

    @field_validator("endpoint")
    @classmethod
    def endpoint_valid(cls, value):
        return valid_endpoint(value)

    @field_validator("p256dh")
    @classmethod
    def point_valid(cls, value):
        ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), decode(value))
        return value

    @field_validator("auth")
    @classmethod
    def auth_valid(cls, value):
        if len(decode(value)) != 16:
            raise ValueError("Invalid auth key")
        return value


def configured():
    return (
        getenv("APP_ENV") == "demo"
        and getenv("PUSH_MODE") == "enrolled-test"
        and bool(getenv("VAPID_PRIVATE_KEY"))
        and bool(getenv("VAPID_PUBLIC_KEY"))
        and getenv("VAPID_SUBJECT", "").startswith("mailto:")
    )


@router.get("/config")
def config():
    return {
        "enabled": bool(configured()),
        "public_key": getenv("VAPID_PUBLIC_KEY", "") if configured() else "",
        "mode": "explicit-test-devices",
    }


@router.post("/subscribe")
async def subscribe(body: Subscription, member: Member):
    if not configured():
        raise HTTPException(503, "Test Web Push is not configured")
    if not body.consent:
        raise HTTPException(422, "Explicit consent required")
    return await member.repository.rpc(
        "push_enrol", {"p_endpoint": body.endpoint, "p_key": body.p256dh, "p_auth": body.auth}
    )


@router.post("/revoke")
async def revoke(member: Member):
    return await member.repository.rpc("push_revoke", {})


class NoRedirect(requests.Session):
    def request(self, method, url, **kwargs):
        valid_endpoint(url)
        kwargs["allow_redirects"] = False
        return super().request(method, url, **kwargs)


def send_test(payload: dict) -> str:
    """Provider acceptance is not a device receipt or a notification read."""
    if not configured():
        return "disabled"
    try:
        valid_endpoint(payload["subscription"]["endpoint"])
        with NoRedirect() as session:
            response = webpush(
                subscription_info=payload["subscription"],
                data=json.dumps(payload["message"]),
                vapid_private_key=getenv("VAPID_PRIVATE_KEY"),
                vapid_claims={"sub": getenv("VAPID_SUBJECT")},
                ttl=min(60, max(0, int(payload["ttl"]))),
                timeout=5,
                requests_session=session,
            )
        return "accepted" if response.status_code in (200, 201, 202) else "failed"
    except WebPushException as error:
        return (
            "invalid"
            if error.response is not None and error.response.status_code in (404, 410)
            else "failed"
        )
    except (ValueError, KeyError, requests.RequestException):
        return "failed"


class Preferences(BaseModel):
    model_config = ConfigDict(extra="forbid")
    radius: int = Field(strict=True, ge=500, le=5000)
    start: str = Field(pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$")
    end: str = Field(pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$")


@router.post("/preferences")
async def preferences(body: Preferences, member: Member):
    return await member.repository.rpc(
        "push_preferences", {"p_radius": body.radius, "p_start": body.start, "p_end": body.end}
    )


@router.get("/workspace")
async def workspace(member: Member):
    return await member.repository.rpc("push_workspace", {})
