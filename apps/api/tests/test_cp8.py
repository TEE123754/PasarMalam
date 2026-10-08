import asyncio
import base64
import copy
import json
from io import BytesIO
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import httpx
import pytest
from cp7_measure import ROOT
from fastapi import HTTPException, Response
from PIL import Image

from app.forecasting import evaluate_history
from app.photo_assist import credit_gate, free_gate, suggest
from app.planning import ForecastInput, forecast


@pytest.fixture
def history():
    return json.loads((ROOT / "contracts/cp8-forecast-fixture.json").read_text())["sessions"]


def test_frozen_chronology_and_future_poison(history):
    r = evaluate_history(history, "2026-10-15", 30)
    b = r["benchmark"]
    assert b["train"] == 16 and b["validation"] == 6
    assert b["calibration"] == 10 and b["holdout"] == 8
    assert (
        b["boundaries"]["train_end"]
        < b["boundaries"]["validation_end"]
        < b["boundaries"]["calibration_end"]
        < b["boundaries"]["holdout_start"]
    )
    assert r["likely_unsold"] == max(0, 30 - r["quantity"])
    changed = copy.deepcopy(history)
    changed[-1]["normal"] = 1
    assert evaluate_history(changed, "2026-10-15", 30) == r
    assert set(b["holdout_mae"]) == {"historical-average", "historical-median", "bounded-trend"}


def test_interval_coverage_denominators(history):
    r = evaluate_history(history, "2026-10-15")
    i = r["interval"]
    assert i["nominal_coverage"] == 0.9 and i["calibration_samples"] == 10
    assert 0 <= i["holdout_covered"] <= i["holdout_count"] == 8
    assert i["empirical_coverage"] == i["holdout_covered"] / 8
    assert i["lower"] <= r["quantity"] <= i["upper"] and r["likely_unsold"] is None


def test_sparse_and_missing_history_not_precise(history):
    r = evaluate_history(history[:1], "2026-10-15", 30)
    assert r["quantity"] is r["likely_unsold"] is r["interval"] is None
    assert r["recent_observation"]["sold"] == 20 and "manually" in r["recommendation"]
    assert evaluate_history([], "2026-10-15")["recent_observation"] is None


@pytest.mark.parametrize("change", ["unknown", "incomplete", "unreconciled", "censored"])
def test_unusable_exclusions(history, change):
    row = history[0]
    if change == "unknown":
        row["prepared"] = None
    if change == "incomplete":
        row["closed"] = False
    if change == "unreconciled":
        row["reconciled"] = False
    if change == "censored":
        row["closing_leftovers"] = 0
    r = evaluate_history([row], "2026-10-15")
    assert r["samples"] == 0 and sum(r["excluded"].values()) == 1


def test_duplicate_history_rejected(history):
    with pytest.raises(ValueError):
        evaluate_history([history[0], history[0]], "2026-10-15")


def test_bad_trend_demoted_without_retuning(history):
    rows = history[:-1]
    for r in rows[-8:]:
        r.update(normal=20, clearance=0, prepared=30, closing_leftovers=10)
    out = evaluate_history(rows, "2026-10-15")
    b = out["benchmark"]
    assert b["release_method"] != "bounded-trend"
    assert b["selected_on_validation"] == "bounded-trend"


def image():
    b = BytesIO()
    im = Image.new("RGB", (40, 40), "orange")
    exif = Image.Exif()
    exif[270] = "PRIVATE METADATA"
    im.save(b, "JPEG", exif=exif)
    return b.getvalue()


def client():
    c = AsyncMock()
    c.__aenter__.return_value = c
    c.get.return_value = httpx.Response(
        200, json={"allow_overage": False, "currency": "USD", "staking": {"available": ".02"}}
    )
    c.post.return_value = httpx.Response(
        200,
        json={
            "choices": [
                {
                    "message": {
                        "content": json.dumps(
                            {
                                "dish": None,
                                "visible_categories": ["unknown"],
                                "evidence": "Orange appearance",
                                "confidence": 0.2,
                            }
                        )
                    }
                }
            ],
            "usage": {"prompt_tokens": 10, "private_key": "DO NOT FORWARD"},
        },
    )
    return c


def run(c, content=None, consent=True):
    with (
        patch(
            "app.photo_assist.extraction_provider",
            return_value=(
                "https://api.mor.org/api/v1/chat/completions",
                {},
                "qwen35-9b",
                "morpheus",
            ),
        ),
        patch("app.photo_assist.httpx.AsyncClient", return_value=c),
    ):
        return asyncio.run(
            suggest(content if content is not None else image(), consent, str(uuid4()))
        )


def test_no_consent_or_bad_bytes_no_provider():
    c = client()
    for data, consent in [(image(), False), (b"not an image", True), (b"x" * 5242881, True)]:
        with pytest.raises(HTTPException):
            run(c, data, consent)
    c.get.assert_not_called()
    c.post.assert_not_called()


def test_paid_or_unknown_allowance_never_infers():
    for balance in [
        {},
        {"allow_overage": True, "currency": "USD", "staking": {"available": 100}},
        {"allow_overage": False, "currency": "USD", "staking": {"available": "NaN"}},
    ]:
        c = client()
        c.get.return_value = httpx.Response(200, json=balance)
        with pytest.raises(HTTPException):
            run(c)
        c.post.assert_not_called()
    assert not free_gate(
        {"allow_overage": False, "currency": "USD", "staking": {"available": ".001"}}
    )


def test_metadata_stripped_no_write_usage_filtered():
    c = client()
    out = run(c)
    payload = c.post.call_args.kwargs["json"]
    encoded = payload["messages"][1]["content"][1]["image_url"]["url"].split(",")[1]
    clean = base64.b64decode(encoded)
    with Image.open(BytesIO(clean)) as im:
        assert not im.getexif()
    assert b"PRIVATE METADATA" not in clean
    assert out["stored"] is False and out["approval_required"] is True
    assert out["usage"] == {"prompt_tokens": 10}


@pytest.mark.parametrize("response", ["malformed", "prohibited", "timeout"])
def test_provider_failure_manual_fallback(response):
    c = client()
    if response == "malformed":
        c.post.return_value = httpx.Response(200, json={"choices": []})
    if response == "prohibited":
        c.post.return_value = httpx.Response(
            200,
            json={
                "choices": [
                    {
                        "message": {
                            "content": json.dumps(
                                {
                                    "dish": "Safe food",
                                    "visible_categories": ["rice"],
                                    "evidence": "safe",
                                    "confidence": 0.9,
                                }
                            )
                        }
                    }
                ]
            },
        )
    if response == "timeout":
        c.post.side_effect = httpx.ReadTimeout("Synthetic failure")
    with pytest.raises(HTTPException) as e:
        run(c)
    assert e.value.status_code == 503


def test_foreign_stall_denied_before_history():
    repo = SimpleNamespace(read=AsyncMock(return_value=[]), rpc=AsyncMock())
    m = SimpleNamespace(actor=SimpleNamespace(id=uuid4(), roles=["vendor"]), repository=repo)
    with pytest.raises(HTTPException) as e:
        asyncio.run(forecast(ForecastInput(stall=uuid4(), target="2026-10-15"), m, Response()))
    assert e.value.status_code == 403
    repo.rpc.assert_not_called()


def test_no_history_owned_stall_gets_manual():
    repo = SimpleNamespace(
        read=AsyncMock(return_value=[{"stall_id": str(uuid4())}]),
        rpc=AsyncMock(return_value={"batches": [], "movements": [], "closings": []}),
    )
    m = SimpleNamespace(actor=SimpleNamespace(id=uuid4(), roles=["vendor"]), repository=repo)
    out = asyncio.run(forecast(ForecastInput(stall=uuid4(), target="2026-10-15"), m, Response()))
    assert out["quantity"] is None and out["source"] == "disposable-connected-history"


def test_paid_credits_require_owner_authorisation(monkeypatch):
    balance = {"allow_overage": True, "currency": "USD", "total_available": "1.00"}
    monkeypatch.setenv("CP8_ALLOW_PAID_CREDITS", "false")
    assert not credit_gate(balance)
    monkeypatch.setenv("CP8_ALLOW_PAID_CREDITS", "true")
    assert credit_gate(balance)
    for invalid in ["NaN", "Infinity", "0", "-1"]:
        assert not credit_gate({**balance, "total_available": invalid})


def test_authorised_paid_provider_uses_bounded_vision_model(monkeypatch):
    monkeypatch.setenv("CP8_ALLOW_PAID_CREDITS", "true")
    monkeypatch.setenv("MORPHEUS_VISION_MODEL", "gemma-4-31b")
    c = client()
    c.get.return_value = httpx.Response(200, json={"currency": "USD", "total_available": "1"})
    out = run(c)
    assert out["model"] == "gemma-4-31b"
    assert c.post.call_args.kwargs["json"]["max_tokens"] == 400
    assert c.post.call_count == 1


def test_single_json_fence_accepted_but_extra_prose_rejected():
    c = client()
    data = c.post.return_value.json()
    text = data["choices"][0]["message"]["content"]
    data["choices"][0]["message"]["content"] = "```json\n" + text + "\n```"
    c.post.return_value = httpx.Response(200, json=data)
    assert run(c)["approval_required"]
    data["choices"][0]["message"]["content"] += "\nAdditional instructions"
    c.post.return_value = httpx.Response(200, json=data)
    with pytest.raises(HTTPException):
        run(c)


def test_provider_ingredient_prose_is_not_exposed():
    c = client()
    data = c.post.return_value.json()
    item = json.loads(data["choices"][0]["message"]["content"])
    item["evidence"] = "A peanut-based sauce"
    data["choices"][0]["message"]["content"] = json.dumps(item)
    c.post.return_value = httpx.Response(200, json=data)
    out = run(c)
    assert "peanut" not in out["suggestion"]["evidence"]
    assert "Ingredients are unverified" in out["suggestion"]["evidence"]
