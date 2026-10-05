"""Real local LLM smoke check on fictional text, explicitly not human speech accuracy."""

import asyncio
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from app.voice import extract_listing
from fastapi import HTTPException

ROOT = Path(__file__).resolve().parents[1]
SAMPLES = {
    "English": "Chicken satay 20 sticks RM 6.00. Ingredients chicken, peanuts. Cooked at 6 pm.",
    "BM": "Satay ayam dua puluh batang RM 6.00. Bahan ayam, kacang. Siap pukul 6 petang.",
    "Manglish": "Chicken satay 20 batang RM 6.00. Bahan ayam, kacang. Ready pukul 6 petang lah.",
}


async def main():
    os.environ["LOCAL_LLM_URL"] = "http://127.0.0.1:8080/v1/chat/completions"
    os.environ["LOCAL_LLM_MODEL"] = "pasar-voice"
    os.environ["LOCAL_LLM_KEY"] = (
        (ROOT / ".local-voice/runtime-key.env").read_text(encoding="utf-8").strip()
    )
    rows = []
    for language, text in SAMPLES.items():
        started = time.perf_counter()
        try:
            result = await extract_listing(
                text, ["Chicken satay"], datetime(2026, 10, 1, 12, tzinfo=timezone.utc)
            )
            rows.append(
                {
                    "language": language,
                    "input": text,
                    "request_seconds": round(time.perf_counter() - started, 3),
                    "result": result,
                }
            )
        except HTTPException as error:
            rows.append(
                {
                    "language": language,
                    "request_seconds": round(time.perf_counter() - started, 3),
                    "http_status": error.status_code,
                    "error": error.detail,
                }
            )
    report = {
        "kind": "actual local LLM on fictional text only",
        "human_recordings": 0,
        "microphone_tests": 0,
        "not_a_speech_accuracy_or_listing_speed_result": True,
        "runtime": "llama.cpp b11146",
        "model": "Qwen2.5-1.5B-Instruct q5_k_m pinned manifest",
        "cases": rows,
    }
    (ROOT / "docs/phase6-llm-smoke.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(
        json.dumps(
            [
                {
                    "language": r["language"],
                    "source": r.get("result", {}).get("source"),
                    "seconds": r["request_seconds"],
                    "http_status": r.get("http_status"),
                }
                for r in rows
            ]
        )
    )
    if any("result" not in r for r in rows):
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
