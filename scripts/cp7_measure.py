"""Offline CP7 collection, freeze and anonymised scoring. No API calls or audio uploads."""

import argparse
import hashlib
import json
import math
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def development_ids():
    pack = json.loads((ROOT / "contracts/cp7-recording-pack.json").read_text(encoding="utf-8"))
    return set(pack["development_ids"])


def fingerprint(value):
    return hashlib.sha256(
        json.dumps(value, sort_keys=True, ensure_ascii=False).encode()
    ).hexdigest()


def words(value):
    return re.findall(r"[^\W_]+", value.lower(), re.UNICODE)


def distance(a, b):
    previous = list(range(len(b) + 1))
    for i, word in enumerate(a, 1):
        row = [i]
        for j, other in enumerate(b, 1):
            row.append(
                min(row[-1] + 1, previous[j] + 1, previous[j - 1] + (word != other))
            )
        previous = row
    return previous[-1]


def quantile(values, p):
    return sorted(values)[math.ceil(len(values) * p) - 1] if values else None


def number(value):
    return type(value) in (int, float) and math.isfinite(value) and value >= 0


def same(field, actual, expected):
    if field == "cook_time" and actual is not None and expected is not None:
        try:
            a, b = datetime.fromisoformat(actual), datetime.fromisoformat(expected)
            return a.tzinfo is not None and b.tzinfo is not None and a == b
        except (TypeError, ValueError):
            return False
    if field == "ingredients" and isinstance(actual, list):
        return {str(x).casefold() for x in actual} == {x.casefold() for x in expected}
    return type(actual) is type(expected) and actual == expected


def freeze(manifest, folder):
    samples = manifest["samples"]
    assert len(samples) == 24 and len({x["id"] for x in samples}) == 24, (
        "24 unique clips required"
    )
    assert Counter(x["language"] for x in samples) == {
        "BM": 10,
        "Manglish": 10,
        "English": 4,
    }
    assert not set(manifest["development_ids"]) & {x["id"] for x in samples}, (
        "Split overlap"
    )
    assert not development_ids() & {x["id"] for x in samples}, (
        "Scripts used for development cannot be frozen as an independent holdout"
    )
    assert len({x["speaker"] for x in samples}) >= 5, "Five actual speakers required"
    assert len({x["audio_sha256"] for x in samples}) == 24, (
        "Each clip needs its own recording"
    )
    for row in samples:
        assert re.fullmatch(r"S\d{2,3}", row["speaker"] or ""), (
            "Anonymous speaker ID required"
        )
        assert row["consented"] is True and row["annotation_verified"] is True
        receipt = (folder / (row.get("consent_receipt") or "")).resolve()
        assert receipt.is_relative_to(folder.resolve()) and receipt.is_file(), (
            "Private consent receipt required"
        )
        assert row.get("accent"), "Speaker-described accent required"
        audio = (folder / (row["audio"] or "")).resolve()
        assert audio.is_relative_to(folder.resolve()) and audio.is_file(), (
            "Private local audio required"
        )
        assert 0 < audio.stat().st_size <= 50_000_000, (
            "Bounded nonempty recording required"
        )
        assert hashlib.sha256(audio.read_bytes()).hexdigest() == row["audio_sha256"], (
            "Audio changed"
        )
    return {
        "manifest_sha256": fingerprint(manifest),
        "status": "frozen-before-inference",
    }


def score(manifest, lock, measurements):
    assert fingerprint(manifest) == lock["manifest_sha256"], "Frozen manifest changed"
    samples = {x["id"]: x for x in manifest["samples"]}
    assert len(samples) == len(manifest["samples"]), "Duplicate manifest IDs"
    assert not set(samples) & set(manifest["development_ids"]), "Split overlap"
    assert not set(samples) & development_ids(), "Development scripts are not a holdout"
    for key in [
        "device",
        "browser",
        "network",
        "speech_model",
        "extraction_model",
        "run_date",
    ]:
        assert isinstance(measurements.get(key), str) and measurements[key].strip(), (
            "Context missing"
        )
    results = measurements["results"]
    assert len({r["id"] for r in results}) == len(results), "Duplicate results"
    for row in results:
        assert row["id"] in samples and row["source"] == "real-inference", (
            "Unknown/synthetic result"
        )
        assert row["status"] in ["ok", "failed", "unsupported"] and row.get(
            "run_evidence"
        ), "Run evidence required"
        assert type(row["corrected"]) is bool and type(row["clarified"]) is bool
        assert isinstance(row.get("recognized"), str), "Transcript string required"
    by_id = {r["id"]: r for r in results}
    groups = {}
    for language in ["BM", "Manglish", "English"]:
        subset = [x for x in samples.values() if x["language"] == language]
        g = {
            "planned": len(subset),
            "executed": 0,
            "failed": 0,
            "unsupported": 0,
            "missing": 0,
            "valid_json": 0,
            "corrections": 0,
            "clarifications": 0,
            "fields": 0,
            "correct_fields": 0,
            "reference_words": 0,
            "word_errors": 0,
            "transcribed": 0,
            "per_field": {},
        }
        for sample in subset:
            row = by_id.get(sample["id"])
            g["fields"] += len(sample["expected"])
            if row is None:
                g["missing"] += 1
                continue
            g["executed"] += 1
            g["failed"] += row["status"] == "failed"
            g["unsupported"] += row["status"] == "unsupported"
            g["corrections"] += row["corrected"]
            g["clarifications"] += row["clarified"]
            draft = row.get("draft")
            try:
                json.dumps(draft, allow_nan=False)
                valid_json = isinstance(draft, dict) and row["status"] == "ok"
            except ValueError:
                valid_json = False
            if valid_json:
                g["valid_json"] += 1
            else:
                draft = {}
            for field, expected in sample["expected"].items():
                # A missing field cannot satisfy an annotated unknown/null.
                correct = field in draft and same(field, draft[field], expected)
                g["correct_fields"] += correct
                counts = g["per_field"].setdefault(
                    field, {"correct": 0, "total_executed": 0}
                )
                counts["correct"] += correct
                counts["total_executed"] += 1
            if row["recognized"].strip():
                reference = words(sample["reference_transcript"])
                g["reference_words"] += len(reference)
                g["word_errors"] += distance(reference, words(row["recognized"]))
                g["transcribed"] += 1
        n = g["executed"]
        g.update(
            critical_accuracy=g["correct_fields"] / g["fields"] if n else None,
            json_validity=g["valid_json"] / n if n else None,
            wer=g["word_errors"] / g["reference_words"]
            if g["reference_words"]
            else None,
            correction_rate=g["corrections"] / n if n else None,
            clarification_rate=g["clarifications"] / n if n else None,
        )
        groups[language] = g
    timings = measurements["timings"]
    assert len({(r["pair"], r["mode"]) for r in timings}) == len(timings), (
        "Duplicate timing lane"
    )
    valid_pairs, excluded, orders = [], [], Counter()
    for pair in sorted({r["pair"] for r in timings}):
        rows = [r for r in timings if r["pair"] == pair]
        valid = len(rows) == 2 and {r["mode"] for r in rows} == {"voice", "typing"}
        if valid:
            a, b = rows
            valid = all(
                a.get(k) == b.get(k) and a.get(k)
                for k in ["clip", "speaker", "device", "network", "order"]
            )
            valid = (
                valid
                and a["clip"] in samples
                and a["speaker"] == samples[a["clip"]]["speaker"]
            )
            valid = valid and a["order"] in ["voice-first", "typing-first"]
            valid = valid and all(
                r.get("consented") is True
                and r.get("confirmed") is True
                and r.get("includes_fixes") is True
                and r.get("cold") is False
                and number(r["seconds"])
                and 0 < r["seconds"] <= 3600
                for r in rows
            )
            voice = next(r for r in rows if r["mode"] == "voice")
            valid = valid and voice.get("input_source") == "live-microphone"
            valid = valid and rows[0]["mode"] == (
                "voice" if a["order"] == "voice-first" else "typing"
            )
        if valid:
            valid_pairs.append(rows)
            orders[rows[0]["order"]] += 1
        else:
            excluded.append(pair)
    lanes = {
        mode: [r["seconds"] for pair in valid_pairs for r in pair if r["mode"] == mode]
        for mode in ["voice", "typing"]
    }
    requests = measurements["requests"]
    assert len({r["id"] for r in requests}) == len(requests), "Duplicate request IDs"
    for r in requests:
        assert number(r["latency_ms"]) and type(r["failed"]) is bool
        assert r["cost"] is None or number(r["cost"]), "Invalid cost"
        assert r["cost"] is None or r.get("billing_evidence"), (
            "Billed/free usage evidence required"
        )
        assert r.get("retry_of") is None or r["retry_of"] in {x["id"] for x in requests}
        for k in ["input_tokens", "output_tokens"]:
            assert r.get(k) is None or type(r[k]) is int and r[k] >= 0, (
                "Invalid token count"
            )
    currencies = {r["currency"] for r in requests if r["cost"] is not None}
    assert len(currencies) <= 1, "Mixed currencies require separate reports"
    success = {
        r["confirmed_update"]
        for r in requests
        if r.get("confirmed_update") and not r["failed"]
    }
    known = bool(requests) and all(r["cost"] is not None for r in requests)
    return {
        "status": "measured-declarations" if results else "Not measured",
        "provenance": "Operator declarations require private recording/run evidence review; no independent certification.",
        "context": {
            k: measurements[k]
            for k in [
                "device",
                "browser",
                "network",
                "speech_model",
                "extraction_model",
                "run_date",
            ]
        },
        "groups": groups,
        "timing": {
            "valid_pairs": len(valid_pairs),
            "excluded_pairs": len(excluded),
            "orders": dict(orders),
            "cold_runs": sum(r.get("cold") is True for r in timings),
            **{
                mode: {
                    "median_seconds": quantile(values, 0.5),
                    "p90_seconds": quantile(values, 0.9),
                }
                for mode, values in lanes.items()
            },
        },
        "requests": {
            "attempts": len(requests),
            "failed": sum(r["failed"] for r in requests),
            "retried": sum(bool(r.get("retry_of")) for r in requests),
            "median_ms": quantile([r["latency_ms"] for r in requests], 0.5),
            "p90_ms": quantile([r["latency_ms"] for r in requests], 0.9),
            "input_tokens": sum(r["input_tokens"] for r in requests)
            if requests and all(r.get("input_tokens") is not None for r in requests)
            else None,
            "output_tokens": sum(r["output_tokens"] for r in requests)
            if requests and all(r.get("output_tokens") is not None for r in requests)
            else None,
            "confirmed_updates": len(success),
            "currency": next(iter(currencies), None),
            "cost_per_success": sum(r["cost"] for r in requests) / len(success)
            if known and success
            else None,
        },
        "targets": manifest["targets"],
        "acceptance": "Pending human/consent/device/interview review; missing runs count against full-set field accuracy.",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["init", "freeze", "report"])
    parser.add_argument("--folder", type=Path, default=ROOT / ".local-evaluation/cp7")
    parser.add_argument("--pack", type=Path, default=ROOT / "contracts/cp7-holdout-v2.json")
    args = parser.parse_args()
    folder = args.folder.resolve()
    assert folder.is_relative_to((ROOT / ".local-evaluation").resolve()), (
        "Use ignored private evaluation folder"
    )
    if args.action == "init":
        folder.mkdir(parents=True, exist_ok=True)
        manifest = json.loads(
            args.pack.read_text(encoding="utf-8")
        )
        data = {
            "device": "",
            "browser": "",
            "network": "",
            "speech_model": "",
            "extraction_model": "",
            "run_date": "",
            "results": [],
            "timings": [],
            "requests": [],
        }
        for name, value in [("manifest.json", manifest), ("measurements.json", data)]:
            with (folder / name).open("x", encoding="utf-8") as f:
                json.dump(value, f, ensure_ascii=False, indent=2)
        print(
            "Private collection templates created; no measurements or consent invented."
        )
        return
    manifest = json.loads((folder / "manifest.json").read_text(encoding="utf-8"))
    if args.action == "freeze":
        lock = freeze(manifest, folder)
        with (folder / "freeze.json").open("x", encoding="utf-8") as f:
            json.dump(lock, f, indent=2)
        print(
            "Holdout frozen. Retuning against this holdout requires a fresh independent set."
        )
        return
    lock = json.loads((folder / "freeze.json").read_text(encoding="utf-8"))
    data = json.loads((folder / "measurements.json").read_text(encoding="utf-8"))
    report = score(manifest, lock, data)
    (folder / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        "Private aggregate report written. Review evidence before publishing anonymised totals."
    )


if __name__ == "__main__":
    main()
