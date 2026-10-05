import json
import time
from pathlib import Path
from uuid import UUID

import httpx
import jwt
import pytest
from app import routes, security
from app.contracts import BatchInput, DiscoverySnapshot, InventoryInput, PromotionInput
from app.main import app
from app.repository import Repository
from app.settings import Settings, validate_project_url
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError

USER = UUID("11111111-1111-4111-8111-111111111111")
SECRET = "only-a-synthetic-unit-test-secret-not-a-deployment-key"
SETTINGS = Settings("http://127.0.0.1:54321", "fake-public-key", SECRET)
ROOT = Path(__file__).resolve().parents[3]


def claims(**changes):
    value = {
        "sub": str(USER),
        "exp": int(time.time()) + 3600,
        "iat": int(time.time()) - 1,
        "iss": SETTINGS.jwt_issuer,
        "aud": "authenticated",
        "role": "authenticated",
    }
    return {**value, **changes}


def token(**changes):
    return jwt.encode(claims(**changes), SECRET, algorithm="HS256")


def test_valid_local_signature():
    assert security.verify_token(token(), SETTINGS) == USER


@pytest.mark.parametrize(
    "changes",
    [
        {"exp": 1},
        {"aud": "anon"},
        {"iss": "https://other.invalid/auth/v1"},
        {"sub": "not-a-uuid"},
        {"role": "service_role"},
        {"iat": int(time.time()) + 3600},
    ],
)
def test_bad_claims_denied(changes):
    with pytest.raises(HTTPException) as error:
        security.verify_token(token(**changes), SETTINGS)
    assert error.value.status_code == 401


def test_tampered_signature_denied():
    forged = jwt.encode(claims(), "another-synthetic-secret", algorithm="HS256")
    with pytest.raises(HTTPException) as error:
        security.verify_token(forged, SETTINGS)
    assert error.value.status_code == 401


def test_hosted_hmac_rejected():
    with pytest.raises(HTTPException) as error:
        security.verify_token(
            token(), Settings(f"https://{'a' * 20}.supabase.co", "public", SECRET)
        )
    assert error.value.status_code == 401


def test_jwks_unknown_key_refreshes(monkeypatch):
    first, second = [
        rsa.generate_private_key(public_exponent=65537, key_size=2048) for _ in range(2)
    ]

    def jwk(key, kid):
        return {
            **json.loads(jwt.algorithms.RSAAlgorithm.to_jwk(key.public_key())),
            "kid": kid,
            "alg": "RS256",
        }

    class LocalKeySet(jwt.PyJWKClient):
        calls = 0
        keys = [jwk(first, "first")]

        def fetch_data(self):
            self.calls += 1
            data = {"keys": self.keys}
            self.jwk_set_cache.put(data)
            return data

    client = LocalKeySet("https://not-called.invalid", cache_keys=False, lifespan=300)
    monkeypatch.setattr(security, "jwks_client", lambda _: client)
    settings = Settings(f"https://{'a' * 20}.supabase.co", "public")
    original = claims(iss=settings.jwt_issuer)
    for key, kid in [(first, "first"), (first, "first"), (second, "second")]:
        if kid == "second":
            client.keys = [jwk(first, "first"), jwk(second, "second")]
        signed = jwt.encode(original, key, algorithm="RS256", headers={"kid": kid})
        assert security.verify_token(signed, settings) == USER
    assert client.calls == 2


def test_metadata_cannot_grant_admin(monkeypatch):
    monkeypatch.setattr(routes, "get_settings", lambda: SETTINGS)

    async def read(self, table, select, **filters):
        if table == "profiles":
            return [{"id": str(USER), "display_name": "Demo", "locale": "en", "verified_at": None}]
        return [{"role": "customer"}]

    monkeypatch.setattr(Repository, "read", read)
    client = TestClient(app)
    headers = {"Authorization": f"Bearer {token(user_metadata={'role': 'admin'})}"}
    assert client.get("/api/v1/me", headers=headers).json()["roles"] == ["customer"]
    assert client.get("/api/v1/admin/summary", headers=headers).status_code == 403
    assert (
        client.post(
            "/api/v1/batches",
            headers=headers,
            json={
                "food_item_id": str(USER),
                "prepared_at": "2026-10-01T00:00:00Z",
                "quantity": 5,
                "request_id": str(USER),
            },
        ).status_code
        == 403
    )


def test_visitor_cannot_call_protected_api():
    assert TestClient(app).get("/api/v1/me").status_code == 401
    assert TestClient(app).get("/api/v1/admin/summary").status_code == 401


@pytest.mark.parametrize(
    "payload",
    [
        {"quantity": -1},
        {"quantity": 1.5},
        {"prepared_at": "2026-10-01T12:00:00"},
    ],
)
def test_bad_batch_inputs(payload):
    with pytest.raises(ValidationError):
        BatchInput.model_validate(
            {
                "food_item_id": USER,
                "prepared_at": "2026-10-01T12:00:00Z",
                "quantity": 2,
                "request_id": USER,
                **payload,
            }
        )


def test_no_fractional_money_or_stock_increase():
    with pytest.raises(ValidationError):
        PromotionInput.model_validate(
            {
                "title": "Demo",
                "price_sen": 1.2,
                "quantity": 2,
                "ends_at": "2026-10-01T13:00:00Z",
                "request_id": USER,
            }
        )
    with pytest.raises(ValidationError):
        InventoryInput.model_validate({"delta": 1, "request_id": USER})


def test_fixture_uses_api_contract():
    fixture = json.loads((ROOT / "contracts/discovery-fixture.json").read_text(encoding="utf-8"))
    parsed = DiscoverySnapshot.model_validate(fixture)
    assert len(parsed.markets) >= 2 and len(parsed.stalls) >= 3
    market_ids = {market.id for market in parsed.markets}
    stall_ids = {stall.id for stall in parsed.stalls}
    assert len(stall_ids) == len(parsed.stalls)
    assert all(stall.marketId in market_ids for stall in parsed.stalls)
    assert all(item.stallId in stall_ids for item in parsed.menu)
    assert set(parsed.model_dump()) == {
        "markets",
        "stalls",
        "offers",
        "updatedAt",
        "menu",
        "batches",
        "publicReviews",
        "server_now",
    }


@pytest.mark.anyio
async def test_repository_forwards_caller_without_service_key(monkeypatch):
    received = []
    original = httpx.AsyncClient

    def handler(request):
        received.append(request)
        return httpx.Response(200, json=[])

    monkeypatch.setattr(
        "app.repository.httpx.AsyncClient",
        lambda **kwargs: original(transport=httpx.MockTransport(handler), **kwargs),
    )
    await Repository(SETTINGS, "caller-jwt").read("profiles", "id")
    assert received[0].headers["authorization"] == "Bearer caller-jwt"
    assert received[0].headers["apikey"] == "fake-public-key"


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.parametrize(
    "url", ["http://169.254.169.254:54321", "https://other.invalid", "http://localhost:9999"]
)
def test_arbitrary_provider_url_denied(url):
    with pytest.raises(ValueError):
        validate_project_url(url)
