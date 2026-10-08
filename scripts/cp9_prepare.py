"""Create private CP9 collection templates without overwriting operator evidence."""

import csv
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def prepare(folder: Path):
    folder.mkdir(parents=True, exist_ok=True)
    details = {
        "status": "Unverified; preparation only",
        "competition": {
            "name": None,
            "official_rules": None,
            "reviewed_date": None,
            "video_limit_seconds": None,
            "track": None,
            "eligibility": None,
            "trl_definition": None,
            "deadline_timezone": None,
        },
        "students": [],
        "supervisor": None,
        "presenter": None,
        "prior_version": {
            "exists": None,
            "reference": None,
            "advancement_evidence": [],
        },
        "image_public_rights": None,
        "reviewer": None,
    }
    files = {"entry-details.json": json.dumps(details, indent=2) + "\n"}
    headers = {
        "rehearsal.csv": [
            "run_id",
            "date",
            "operator",
            "device",
            "os",
            "browser",
            "network",
            "scene_id",
            "observed_seconds",
            "result",
            "deviation",
            "evidence_file",
        ],
        "video-review.csv": [
            "file",
            "sha256",
            "observed_duration_seconds",
            "student_presenter",
            "reviewer",
            "review_date",
            "english_narration",
            "readable_captions",
            "private_data_absent",
            "full_core_workflow",
            "backup_playback",
            "issues",
            "result",
        ],
    }
    for name, header in headers.items():
        text = io.StringIO(newline="")
        csv.writer(text).writerow(header)
        files[name] = text.getvalue()
    created = []
    for name, content in files.items():
        path = folder / name
        try:
            with path.open("x", encoding="utf-8", newline="") as file:
                file.write(content)
            created.append(name)
        except FileExistsError:
            pass
    return created


if __name__ == "__main__":
    created = prepare(ROOT / ".local-evaluation/cp9")
    print(f"CP9 private templates: {len(created)} created; existing evidence preserved")
