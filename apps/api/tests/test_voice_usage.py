"""Token provenance and actual provider transport boundaries; synthetic fixtures only."""

import asyncio
import json
from datetime import datetime, timezone

import httpx
import pytest

from app import voice
from app.voice_usage import token_usage


@pytest.mark.parametrize(
    "value",
    [
        None,
        [],
        "unknown",
        {"prompt_tokens": True, "completion_tokens": -1},
        {"prompt_tokens": 1.5, "completion_tokens": 1_000_000_001},
    ],
)
def test_absent_or_invalid_usage_is_unknown_not_free(value):
    assert token_usage(value) == {"input_tokens": None, "output_tokens": None}


def test_only_provider_token_counts_leave_the_response():
    assert token_usage(
        {"prompt_tokens": 0, "completion_tokens": 18, "api_key": "private", "cost": 999}
    ) == {
        "input_tokens": 0,
        "output_tokens": 18,
    }


def test_real_transport_result_has_observed_duration_and_whitelisted_usage(monkeypatch):
    monkeypatch.setenv("EXTRACTION_PROVIDER", "morpheus")
    monkeypatch.setenv("MORPHEUS_API_KEY", "fictional-test-key")
    monkeypatch.setenv("MORPHEUS_BASE_URL", "https://api.mor.org/api/v1")
    monkeypatch.setenv("MORPHEUS_MODEL", "qwen35-9b")
    real_client = httpx.AsyncClient
    value = voice.Draft(
        dish="Chicken satay",
        quantity=None,
        unit=None,
        price_sen=None,
        ingredients=[],
        cook_time=None,
        timezone="Asia/Kuala_Lumpur",
        action="create_batch",
        confidence=0,
        evidence={"dish": ["Chicken satay"]},
    ).model_dump(mode="json")

    def handler(request):
        return httpx.Response(
            200,
            json={
                "choices": [{"message": {"content": json.dumps(value)}}],
                "usage": {"prompt_tokens": 23, "completion_tokens": 45, "secret": "do not forward"},
            },
        )

    monkeypatch.setattr(
        voice.httpx,
        "AsyncClient",
        lambda **kw: real_client(transport=httpx.MockTransport(handler), **kw),
    )
    result = asyncio.run(
        voice.extract_listing("Chicken satay", ["Chicken satay"], datetime.now(timezone.utc), True)
    )
    measurement = result["measurement"]
    assert set(measurement) == {"provider_latency_ms", "input_tokens", "output_tokens"}
    assert measurement["provider_latency_ms"] >= 0
    assert measurement["input_tokens"] == 23
    assert measurement["output_tokens"] == 45
    assert "secret" not in json.dumps(result)
