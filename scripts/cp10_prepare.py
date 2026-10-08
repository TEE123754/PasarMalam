"""Prepare private evidence templates, or validate them offline without network access."""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps/api"))
from app.partner_readiness import KINDS, REQUIREMENTS, Evidence, assess


def prepare(folder: Path) -> list[str]:
    folder.mkdir(parents=True, exist_ok=True)
    created = []
    for kind in KINDS:
        item = Evidence(
            kind=kind, checks=dict.fromkeys(sorted(REQUIREMENTS[kind]), False)
        )
        path = folder / f"{kind}.json"
        try:
            with path.open("x", encoding="utf-8") as file:
                file.write(item.model_dump_json(indent=2) + "\n")
            created.append(path.name)
        except FileExistsError:
            pass
    return created


def review(folder: Path, now: datetime) -> dict:
    results = []
    for kind in KINDS:
        try:
            item = Evidence.model_validate_json(
                (folder / f"{kind}.json").read_text("utf-8")
            )
            if item.kind != kind:
                raise ValueError("File and kind disagree")
            results.append(assess(item, now))
        except (OSError, ValueError):
            # Do not echo validation input: it can contain private agreement details.
            results.append({"kind": kind, "status": "invalid_or_missing_file"})
    return {"external_transmission_enabled": False, "results": results}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--review", action="store_true")
    args = parser.parse_args()
    folder = ROOT / ".local-evaluation/cp10"
    if args.review:
        print(json.dumps(review(folder, datetime.now(timezone.utc)), indent=2))
    else:
        print(
            f"CP10: {len(prepare(folder))} templates created; existing evidence preserved"
        )
