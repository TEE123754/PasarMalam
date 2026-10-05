"""Provider boundaries, consent, malformed output and bounded transport."""

import asyncio
import json
from datetime import datetime, timezone

import httpx
import pytest
from app import voice
from fastapi import HTTPException


@pytest.fixture
def provider(monkeypatch):
    monkeypatch.setenv("EXTRACTION_PROVIDER", "morpheus")
    monkeypatch.setenv("MORPHEUS_API_KEY", "fictional-test-key")
    monkeypatch.setenv("MORPHEUS_BASE_URL", "https://api.mor.org/api/v1")
    monkeypatch.setenv("MORPHEUS_MODEL", "qwen35-9b")


def test_external_consent_required_before_any_transport(provider):
    with pytest.raises(HTTPException) as error:
        asyncio.run(voice.extract_listing("Chicken satay", [], datetime.now(timezone.utc)))
    assert error.value.status_code == 422


@pytest.mark.parametrize(
    "url", ["http://api.mor.org/api/v1", "https://evil.example", "https://api.mor.org/api/v1?key=x"]
)
def test_provider_url_cannot_redirect_credentials(provider, monkeypatch, url):
    monkeypatch.setenv("MORPHEUS_BASE_URL", url)
    with pytest.raises(HTTPException):
        voice.extraction_provider()


def test_valid_response_is_still_evidence_checked(provider, monkeypatch):
    real_client = httpx.AsyncClient
    seen = []

    def handler(request):
        seen.append(json.loads(request.content))
        draft = {
            "dish": "Chicken satay",
            "quantity": 10,
            "unit": "stick",
            "price_sen": 500,
            "ingredients": ["chicken"],
            "cook_time": None,
            "timezone": "Asia/Kuala_Lumpur",
            "action": "create_batch",
            "confidence": 1,
            "evidence": {
                "dish": ["Chicken satay"],
                "quantity": [],
                "price_sen": [],
                "ingredients": [],
                "cook_time": [],
            },
        }
        return httpx.Response(200, json={"choices": [{"message": {"content": json.dumps(draft)}}]})

    monkeypatch.setattr(
        voice.httpx,
        "AsyncClient",
        lambda **kw: real_client(transport=httpx.MockTransport(handler), **kw),
    )
    result = asyncio.run(
        voice.extract_listing("Chicken satay", ["Chicken satay"], datetime.now(timezone.utc), True)
    )
    assert result["source"] == "morpheus"
    assert result["draft"]["quantity"] is None
    assert result["draft"]["confidence"] == 0
    assert seen[0]["model"] == "qwen35-9b"
    assert seen[0]["max_tokens"] == 800
    assert seen[0]["reasoning"] == {"enabled": False}
    assert "tools" not in seen[0]


@pytest.mark.parametrize(
    "response",
    [
        httpx.Response(429),
        httpx.Response(302, headers={"Location": "https://evil.example"}),
        httpx.Response(200, json={"choices": [{"message": {"content": "x" * 21000}}]}),
    ],
)
def test_provider_errors_use_fallback_without_retry(provider, monkeypatch, response):
    real_client = httpx.AsyncClient
    calls = []

    def handler(request):
        calls.append(request)
        return response

    monkeypatch.setattr(
        voice.httpx,
        "AsyncClient",
        lambda **kw: real_client(transport=httpx.MockTransport(handler), **kw),
    )
    with pytest.raises(HTTPException) as error:
        asyncio.run(voice.extract_listing("Chicken satay", [], datetime.now(timezone.utc), True))
    assert error.value.status_code == 503
    assert len(calls) == 1
