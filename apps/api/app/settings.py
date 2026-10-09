"""Server-only configuration. No privileged key is used by request handlers."""

import re
from dataclasses import dataclass
from functools import lru_cache
from os import getenv
from pathlib import Path
from typing import Literal
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def validate_project_url(value: str) -> str:
    parsed = urlparse(value)
    hosted = parsed.scheme == "https" and bool(
        re.fullmatch(r"[a-z0-9]{20}\.supabase\.co", parsed.hostname or "")
    )
    local = parsed.scheme == "http" and parsed.hostname in {"127.0.0.1", "localhost"}
    if (
        not (hosted or local)
        or parsed.username
        or parsed.password
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("Use a configured Supabase project URL or loopback local stack")
    if parsed.path not in {"", "/"} or (local and parsed.port != 54321):
        raise ValueError("Unexpected Supabase API path or local port")
    return value.rstrip("/")


@dataclass(frozen=True)
class Settings:
    url: str = ""
    publishable_key: str = ""
    local_jwt_secret: str = ""
    issuer: str = ""
    registration_policy: Literal["invite-only", "public"] = "invite-only"

    @property
    def configured(self) -> bool:
        return bool(self.url and self.publishable_key)

    @property
    def jwt_issuer(self) -> str:
        return self.issuer or f"{self.url}/auth/v1"


@lru_cache
def get_settings() -> Settings:
    url = getenv("SUPABASE_URL", "")
    if url:
        url = validate_project_url(url)
    key = getenv("SUPABASE_PUBLISHABLE_KEY", "")
    if key.startswith("sb_secret_"):
        raise ValueError("Request client requires a publishable key")
    # Reject a legacy service-role JWT accidentally supplied as the public API key.
    if key.count(".") == 2:
        import jwt

        if jwt.decode(key, options={"verify_signature": False}).get("role") != "anon":
            raise ValueError("Only a legacy anon key may be used by the request client")
    secret = getenv("SUPABASE_JWT_SECRET", "") if url.startswith("http://") else ""
    policy = getenv("REGISTRATION_POLICY", "invite-only")
    if policy not in {"invite-only", "public"}:
        raise ValueError("Unexpected registration policy")
    return Settings(url, key, secret, getenv("SUPABASE_JWT_ISSUER", ""), policy)
