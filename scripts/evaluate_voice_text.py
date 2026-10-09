"""Actual Morpheus inference on development scripts; excludes audio/holdout accuracy claims."""

import argparse
import asyncio
import json
import os
import re
import time
from datetime import datetime
from pathlib import Path

from app.voice import PROMPT_VERSION, extract_listing
from dotenv import load_dotenv
from fastapi import HTTPException

ROOT = Path(__file__).resolve().parents[1]
MENU = [
    "Nasi lemak ayam",
    "Chicken satay",
    "Kuih talam",
    "Popia sayur",
    "Fresh lime drink",
    "Pisang goreng",
    "Cendol",
    "Pork noodles",
]


def project(result):
    """Documented app-to-script names. Never alter inferred numeric values to match answers."""
    draft = result["draft"]
    action = {"update_stock": "update-quantity", "create_batch": "new-batch"}.get(draft["action"])
    return {
        **draft,
        "action": action or draft["action"],
        "unit": draft.get("spoken_unit") or draft["unit"],
        "batch_number": draft.get("batch_reference"),
        "remaining_quantity": draft["quantity"] if draft["action"] == "update_stock" else None,
        "needs_clarification": bool(result["flags"])
        or (
            draft.get("batch_reference") is None
            if draft["action"] == "update_stock"
            else any(
                draft[field] is None for field in ["dish", "quantity", "price_sen", "cook_time"]
            )
        ),
    }


def same(actual, expected):
    if isinstance(expected, list):
        return isinstance(actual, list) and {x.casefold() for x in actual} == {
            x.casefold() for x in expected
        }
    return actual == expected


async def run(args):
    if not args.allow_cloud:
        raise ValueError("Explicit --allow-cloud required for Morpheus transcript processing")
    load_dotenv(ROOT / "apps/api/.env")
    os.environ["EXTRACTION_PROVIDER"] = "morpheus"
    pack = json.loads((ROOT / "contracts/cp7-recording-pack.json").read_text(encoding="utf-8"))
    folder = ROOT / ".local-evaluation/voice-enhancement"
    folder.mkdir(parents=True, exist_ok=True)
    if not re.fullmatch(r"[a-z0-9-]{1,40}", args.run_label):
        raise ValueError("Invalid run label")
    target = folder / f"cp7-text-{args.run_label}.json"
    if target.exists():
        raise ValueError("Existing run preserved; choose a new label for a justified repair")
    output = {
        "kind": "Script-only development regression, actual Morpheus inference; no ASR",
        "prompt_version": PROMPT_VERSION,
        "reference_now": pack["reference_now"],
        "run_date": datetime.now().astimezone().isoformat(),
        "results": [],
    }
    for sample in pack["samples"]:
        start = time.perf_counter()
        row = {"id": sample["id"], "language": sample["language"], "status": "failed"}
        try:
            result = await extract_listing(
                sample["reference_transcript"],
                MENU,
                datetime.fromisoformat(pack["reference_now"]),
                external_consent=True,
            )
            actual = project(result)
            row.update(
                status="ok",
                extraction=result,
                compared=actual,
                fields={
                    field: same(actual.get(field), expected)
                    for field, expected in sample["expected"].items()
                },
            )
        except HTTPException as error:
            row.update(
                http_status=error.status_code,
                error=error.detail,
                fields={field: False for field in sample["expected"]},
            )
        row["latency_ms"] = round((time.perf_counter() - start) * 1000)
        output["results"].append(row)
        target.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{sample['id']}: {row['status']}", flush=True)
    aggregate = {
        "kind": output["kind"],
        "prompt_version": PROMPT_VERSION,
        "total": len(output["results"]),
        "valid": sum(row["status"] == "ok" for row in output["results"]),
        "groups": {},
    }
    for language in ["BM", "Manglish", "English"]:
        rows = [row for row in output["results"] if row["language"] == language]
        correct = sum(sum(row["fields"].values()) for row in rows)
        fields = sum(len(row["fields"]) for row in rows)
        aggregate["groups"][language] = {
            "clips": len(rows),
            "correct_fields": correct,
            "fields": fields,
            "accuracy": correct / fields,
            "all_correct": sum(all(row["fields"].values()) for row in rows),
        }
    aggregate["run_label"] = args.run_label
    aggregate_path = ROOT / "docs/voice-text-regression-results.json"
    previous = (
        json.loads(aggregate_path.read_text(encoding="utf-8")) if aggregate_path.exists() else {}
    )
    runs = previous.get("runs", [previous] if previous else [])
    aggregate_path.write_text(
        json.dumps({"kind": output["kind"], "runs": [*runs, aggregate]}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(aggregate))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--allow-cloud", action="store_true")
    parser.add_argument("--run-label", default="v4")
    asyncio.run(run(parser.parse_args()))
