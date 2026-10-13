"""Run the existing local listing extractor on private uncorrected recognition results."""

import argparse
import asyncio
import json
import os
import re
import time
from datetime import datetime
from pathlib import Path

from app.voice import extract_listing
from dotenv import load_dotenv
from fastapi import HTTPException

ROOT = Path(__file__).resolve().parents[1]


async def run(
    folder: Path,
    profile: str,
    provider: str,
    allow_cloud: bool,
    ids: list[str],
    label: str,
    input_file: str | None = None,
):
    manifest = json.loads((folder / "manifest.json").read_text(encoding="utf-8"))
    source = input_file or (
        "transcriptions-small.json" if profile == "small" else "transcriptions-language.json"
    )
    if Path(source).name != source or not source.endswith(".json"):
        raise ValueError("Input must be a local collection JSON filename")
    data = json.loads((folder / source).read_text(encoding="utf-8"))
    if not re.fullmatch(r"[a-z0-9-]{1,40}", label):
        raise ValueError("Invalid run label")
    suffix = "-" + label if ids or input_file else ""
    target = folder / f"measured-results-{profile}-{provider}{suffix}.json"
    if ids:
        data["results"] = [row for row in data["results"] if row["id"] in ids]
        if {row["id"] for row in data["results"]} != set(ids):
            raise ValueError("Unknown clip IDs")
        data["run_kind"] = "Affected repair rerun; initial failures retained separately"
    if target.exists():
        raise ValueError("Results already exist; preserved without overwrite")
    if provider == "morpheus" and not allow_cloud:
        raise ValueError("Morpheus requires explicit transcript-processing consent")
    load_dotenv(ROOT / "apps/api/.env")
    os.environ["EXTRACTION_PROVIDER"] = provider
    if provider == "local":
        os.environ["LOCAL_LLM_URL"] = "http://127.0.0.1:8080/v1/chat/completions"
        os.environ["LOCAL_LLM_MODEL"] = "pasar-voice"
        os.environ["LOCAL_LLM_KEY"] = (ROOT / ".local-voice/runtime-key.env").read_text().strip()
        data["model"] += "; llama.cpp b11146; Qwen2.5-1.5B-Instruct q5_k_m"
    else:
        data["model"] += "; Morpheus qwen35-9b"
        data["transcript_processing_authorization"] = (
            "Operator supplied explicit --allow-cloud transcript-processing authorization"
        )
    data["reference_now"] = manifest["reference_now"]
    data["reference_verification"] = manifest["reference_verification"]
    data["input_file"] = source
    data["extraction_run_date"] = datetime.now().astimezone().isoformat()
    data["run_kind"] = data.get("run_kind", "Development rerun; original first runs preserved")
    for row in data["results"]:
        begun = time.perf_counter()
        try:
            if not row["recognized"].strip() or len(row["recognized"]) > 1000:
                raise HTTPException(422, "Empty or oversized recognized transcript")
            result = await extract_listing(
                row["recognized"],
                ["Chicken satay"],
                datetime.fromisoformat(manifest["reference_now"]),
                external_consent=allow_cloud,
            )
            row["draft"] = result["draft"]
            row["extraction"] = result
            row["status"] = "ok"
        except HTTPException as error:
            row["status"] = "failed"
            row["http_status"] = error.status_code
            row["error"] = error.detail
        row["extraction_ms"] = round((time.perf_counter() - begun) * 1000)
        target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"{row['id']}: {row['status']} ({row['extraction_ms']} ms)", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--folder", type=Path, default=ROOT / ".local-evaluation/supplied-satay")
    parser.add_argument("--profile", choices=["tiny", "small", "turbo"], default="tiny")
    parser.add_argument("--provider", choices=["local", "morpheus"], default="local")
    parser.add_argument("--allow-cloud", action="store_true")
    parser.add_argument("--ids", nargs="*", default=[])
    parser.add_argument("--run-label", default="repair")
    parser.add_argument("--input", dest="input_file")
    args = parser.parse_args()
    asyncio.run(
        run(
            args.folder,
            args.profile,
            args.provider,
            args.allow_cloud,
            args.ids,
            args.run_label,
            args.input_file,
        )
    )
