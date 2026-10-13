"""Synthetic scorer fixtures only; never participant evidence."""

import copy
import hashlib
import json
from pathlib import Path

import pytest
from cp7_measure import ROOT, distance, fingerprint, freeze, score, words


@pytest.fixture
def fixture():
    manifest = json.loads((ROOT / "contracts/cp7-holdout-v2.json").read_text(encoding="utf-8"))
    for i, s in enumerate(manifest["samples"]):
        s["speaker"] = f"S{i % 5 + 1:02}"
    lock = {"manifest_sha256": fingerprint(manifest)}
    measurements = {
        k: "SYNTHETIC SCORER TEST"
        for k in ["device", "browser", "network", "speech_model", "extraction_model", "run_date"]
    }
    measurements.update(results=[], timings=[], requests=[])
    return manifest, lock, measurements


def test_empty_has_no_measured_accuracy_or_cost(fixture):
    m, lock, data = fixture
    r = score(m, lock, data)
    assert r["status"] == "Not measured"
    assert r["groups"]["BM"]["missing"] == 10
    assert r["groups"]["BM"]["critical_accuracy"] is None
    assert r["requests"]["cost_per_success"] is None


def result(sample):
    return {
        "id": sample["id"],
        "source": "real-inference",
        "status": "ok",
        "run_evidence": "synthetic-unit-fixture",
        "recognized": sample["reference_transcript"],
        "draft": copy.deepcopy(sample["expected"]),
        "corrected": False,
        "clarified": False,
    }


def test_full_denominator_not_only_successes(fixture):
    m, lock, data = fixture
    data["results"] = [result(m["samples"][0])]
    g = score(m, lock, data)["groups"]["BM"]
    assert g["executed"] == 1 and g["missing"] == 9 and g["wer"] == 0
    assert 0 < g["critical_accuracy"] < 0.2


def test_unknown_must_be_explicit_and_bool_not_integer(fixture):
    m, lock, data = fixture
    row = result(m["samples"][9])
    del row["draft"]["cook_time"]
    row["draft"]["quantity"] = True
    data["results"] = [row]
    g = score(m, lock, data)["groups"]["BM"]
    assert g["per_field"]["cook_time"]["correct"] == 0
    assert g["per_field"]["quantity"]["correct"] == 0


def test_failed_and_unsupported_retained(fixture):
    m, lock, data = fixture
    rows = [result(s) for s in m["samples"][:2]]
    rows[0]["status"] = "failed"
    rows[1]["status"] = "unsupported"
    data["results"] = rows
    g = score(m, lock, data)["groups"]["BM"]
    assert g["failed"] == g["unsupported"] == 1 and g["valid_json"] == 0


@pytest.mark.parametrize("change", ["manifest", "duplicate", "synthetic", "split"])
def test_provenance_rejection(fixture, change):
    m, lock, data = fixture
    row = result(m["samples"][0])
    data["results"] = [row]
    if change == "manifest":
        m["reference_now"] = "changed"
    if change == "duplicate":
        data["results"].append(row)
    if change == "synthetic":
        row["source"] = "scripted"
    if change == "split":
        m["development_ids"].append(m["samples"][0]["id"])
        lock["manifest_sha256"] = fingerprint(m)
    with pytest.raises(AssertionError):
        score(m, lock, data)


def pair(m):
    s = m["samples"][0]
    common = {
        "pair": "unit-only",
        "clip": s["id"],
        "speaker": s["speaker"],
        "device": "test",
        "network": "test",
        "order": "voice-first",
        "consented": True,
        "confirmed": True,
        "includes_fixes": True,
        "cold": False,
        "input_source": "live-microphone",
    }
    return [{**common, "mode": "voice", "seconds": 20}, {**common, "mode": "typing", "seconds": 30}]


def test_valid_pair_and_cold_supplied_audio_exclusion(fixture):
    m, lock, data = fixture
    data["timings"] = pair(m)
    assert score(m, lock, data)["timing"]["voice"]["median_seconds"] == 20
    data["timings"][0]["input_source"] = "supplied-file"
    assert score(m, lock, data)["timing"]["valid_pairs"] == 0
    data["timings"][0]["input_source"] = "live-microphone"
    data["timings"][0]["cold"] = True
    assert score(m, lock, data)["timing"]["cold_runs"] == 1
    assert score(m, lock, data)["timing"]["valid_pairs"] == 0


def test_mismatched_order_and_device_not_paired(fixture):
    m, lock, data = fixture
    data["timings"] = list(reversed(pair(m)))
    assert score(m, lock, data)["timing"]["valid_pairs"] == 0
    data["timings"] = pair(m)
    data["timings"][1]["device"] = "other"
    assert score(m, lock, data)["timing"]["valid_pairs"] == 0


def test_cost_includes_failed_retries_unknown_never_zero(fixture):
    m, lock, data = fixture
    request = {
        "id": "a",
        "latency_ms": 100,
        "failed": True,
        "retry_of": None,
        "cost": 0.01,
        "currency": "USD",
        "billing_evidence": "unit-test",
        "input_tokens": 10,
        "output_tokens": 2,
        "confirmed_update": None,
    }
    data["requests"] = [
        request,
        {
            **request,
            "id": "b",
            "failed": False,
            "retry_of": "a",
            "cost": 0.02,
            "confirmed_update": "confirmed-unit",
        },
    ]
    r = score(m, lock, data)["requests"]
    assert r["cost_per_success"] == 0.03 and r["failed"] == r["retried"] == 1
    data["requests"][0]["cost"] = None
    assert score(m, lock, data)["requests"]["cost_per_success"] is None


def test_no_consent_no_freeze(fixture, tmp_path: Path):
    m, _, _ = fixture
    with pytest.raises(AssertionError):
        freeze(m, tmp_path)


def test_word_normalisation_and_edit_distance():
    assert words("RM 4.50, siap!") == ["rm", "4", "50", "siap"]
    assert distance(["a", "b"], ["a", "c", "d"]) == 2


def test_used_scripts_cannot_be_relabelled_as_holdout(fixture):
    manifest, _, measurements = fixture
    manifest["samples"][0]["id"] = "cp7-01"
    manifest["development_ids"] = []  # Removing the operator declaration cannot evade the guard.
    with pytest.raises(AssertionError, match="Development scripts"):
        score(manifest, {"manifest_sha256": fingerprint(manifest)}, measurements)


def test_freeze_checks_real_files_and_changed_audio(fixture, tmp_path):
    m, _, _ = fixture
    for i, sample in enumerate(m["samples"]):
        audio = tmp_path / f"clip-{i}.wav"
        audio.write_bytes(f"SYNTHETIC HASH FIXTURE {i}".encode())
        receipt = tmp_path / f"{sample['speaker']}.txt"
        receipt.write_text("SYNTHETIC UNIT RECEIPT ONLY", encoding="utf-8")
        sample.update(
            audio=audio.name,
            audio_sha256=hashlib.sha256(audio.read_bytes()).hexdigest(),
            consented=True,
            consent_receipt=receipt.name,
            annotation_verified=True,
            accent="test-only",
        )
    assert freeze(m, tmp_path)["manifest_sha256"] == fingerprint(m)
    (tmp_path / "clip-0.wav").write_bytes(b"CHANGED")
    with pytest.raises(AssertionError):
        freeze(m, tmp_path)


def test_nonfinite_draft_not_valid_json(fixture):
    m, lock, data = fixture
    row = result(m["samples"][0])
    row["draft"]["price_sen"] = float("nan")
    data["results"] = [row]
    assert score(m, lock, data)["groups"]["BM"]["valid_json"] == 0
