"""Verify identity cryptographically; business roles are fetched from protected DB rows."""

from functools import lru_cache
from uuid import UUID

import jwt
from fastapi import HTTPException
from jwt import PyJWKClient
from jwt.exceptions import PyJWKClientConnectionError

from .settings import Settings


@lru_cache(maxsize=4)
def jwks_client(url: str) -> PyJWKClient:
    # Unknown kid triggers a refresh; key-set TTL is bounded for revocation/rotation.
    return PyJWKClient(
        f"{url}/auth/v1/.well-known/jwks.json",
        cache_keys=False,
        cache_jwk_set=True,
        lifespan=300,
        timeout=5,
    )


def verify_token(token: str, settings: Settings) -> UUID:
    if not settings.configured:
        raise HTTPException(503, "Authentication is not configured")
    if len(token) > 16384:
        raise HTTPException(401, "Invalid or expired session")
    try:
        algorithm = jwt.get_unverified_header(token).get("alg")
        if (
            algorithm == "HS256"
            and settings.url.startswith("http://")
            and settings.local_jwt_secret
        ):
            key = settings.local_jwt_secret
        elif algorithm in {"ES256", "RS256"}:
            key = jwks_client(settings.url).get_signing_key_from_jwt(token).key
        else:
            raise jwt.InvalidAlgorithmError("Unsupported session algorithm")
        claims = jwt.decode(
            token,
            key,
            algorithms=[algorithm],
            audience="authenticated",
            issuer=settings.jwt_issuer,
            # Auth and this host can differ by a fraction of a second at sign-in.
            leeway=2,
            options={"require": ["sub", "exp", "iat", "iss", "aud"]},
        )
        if claims.get("role") != "authenticated":
            raise jwt.InvalidTokenError("User session required")
        return UUID(claims["sub"])
    except PyJWKClientConnectionError as error:
        raise HTTPException(503, "Signing key service unavailable") from error
    except (jwt.PyJWTError, ValueError, TypeError) as error:
        raise HTTPException(401, "Invalid or expired session") from error
