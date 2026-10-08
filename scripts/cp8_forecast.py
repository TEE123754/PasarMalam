"""Reproducible offline forecast benchmark; explicit synthetic versus consented provenance."""

import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps/api"))
from app.forecasting import evaluate_history


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input", type=Path, default=ROOT / "contracts/cp8-forecast-fixture.json"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / ".local-evaluation/cp8-forecast-report.json",
    )
    args = parser.parse_args()
    content = args.input.read_bytes()
    data = json.loads(content)
    if data["source"] not in ["synthetic", "consented-recorded"]:
        raise ValueError("Explicit history source required")
    if data["source"] == "consented-recorded" and not data.get("consent_evidence"):
        raise ValueError("Private consent evidence required")
    rows = data["sessions"]
    if len(rows) > 5000:
        raise ValueError("History exceeds limit")
    result = evaluate_history(rows, data["target"], data.get("planned"))
    result.update(
        source=data["source"],
        input_sha256=hashlib.sha256(content).hexdigest(),
        real_benchmark="Not established"
        if data["source"] == "synthetic"
        else "Operator provenance requires review",
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print("Forecast report written; " + data["source"] + " provenance retained")


if __name__ == "__main__":
    main()
