"""Explicit small fictional extraction smoke; never claims human speech accuracy."""

import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "apps/api/.env")
sys.path.insert(0, str(ROOT / "apps/api"))
from app.voice import extract_listing  # noqa: E402


async def run():
    samples = [
        "Chicken satay 20 sticks RM 6.00. Ingredients chicken, peanuts. Cooked at 5 pm.",
        "Satay ayam dua puluh batang RM 6.00. Bahan ayam, kacang. Siap pukul 5 petang.",
        "Chicken satay dua puluh sticks RM 6.00 lah. Ingredients chicken, peanuts. Siap 5 pm.",
    ]
    results = []
    for text in samples:
        try:
            r = await extract_listing(
                text, ["Chicken satay"], datetime.now(timezone.utc), True
            )
            d = r["draft"]
            results.append(
                {
                    "source": r["source"],
                    "dish": d["dish"],
                    "quantity": d["quantity"],
                    "price_sen": d["price_sen"],
                    "cook_time": d["cook_time"],
                    "flags": r["flags"],
                }
            )
        except Exception as error:
            cause = error.__cause__
            row = {
                "status": "extraction unavailable; manual fallback required",
                "failure_type": type(cause).__name__,
            }
            if str(cause).startswith("Provider returned non-text content:"):
                row["content_type"] = str(cause).split(":")[-1].strip()
            if getattr(cause, "response", None) is not None:
                row["provider_status"] = cause.response.status_code
            if hasattr(cause, "errors"):
                row["validation"] = [
                    {"field": str(e["loc"]), "type": e["type"]}
                    for e in cause.errors(include_input=False)
                ]
            results.append(row)
    (ROOT / "docs/morpheus-smoke.json").write_text(
        json.dumps(
            {
                "fictional_text_only": True,
                "human_accuracy": "not measured",
                "results": results,
            },
            indent=2,
        )
        + "\n"
    )
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    asyncio.run(run())
