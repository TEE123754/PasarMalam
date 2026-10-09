"""Import the consented original satay pack privately without changing source audio."""

import argparse
import hashlib
import json
import re
import subprocess
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def import_pack(archive: Path, folder: Path, probe: Path, consent_evidence: str):
    if not consent_evidence.strip():
        raise ValueError("Supply actual consent evidence before importing recordings")
    corpus = json.loads((ROOT / "contracts/voice-evaluation.json").read_text())
    samples = {row["id"]: row for row in corpus["samples"]}
    rows = []
    with zipfile.ZipFile(archive) as pack:
        entries = [entry for entry in pack.infolist() if not entry.is_dir()]
        if len(entries) != 24 or sum(entry.file_size for entry in entries) > 120_000_000:
            raise ValueError("Expected 24 bounded recordings")
        for entry in entries:
            match = re.fullmatch(r"audio/S(0[1-5])/s\1-(bm|manglish)-(0[12])", entry.filename)
            english = re.fullmatch(r"audio/S(0[1-4])/s\1-english", entry.filename)
            if match:
                speaker, language, index = match.groups()
                clip = f"{language}-{(int(speaker)-1)*2+int(index):02d}"
            elif english:
                speaker = english[1]
                clip = f"en-{int(speaker):02d}"
            else:
                raise ValueError("Unexpected recording path")
            if entry.file_size > 5_000_000:
                raise ValueError("Recording exceeds 5 MB")
            data = pack.read(entry)
            if not data.startswith(b"OggS"):
                raise ValueError("Expected Ogg recording")
            path = folder / "audio" / f"{clip}.ogg"
            path.parent.mkdir(parents=True, exist_ok=True)
            if path.exists() and path.read_bytes() != data:
                raise ValueError("Existing source differs; use a new collection folder")
            path.write_bytes(data)
            metadata = json.loads(subprocess.run(
                [str(probe), "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)],
                capture_output=True, text=True, check=True,
            ).stdout)
            streams = metadata["streams"]
            duration = float(metadata["format"]["duration"])
            if len(streams) != 1 or streams[0]["codec_type"] != "audio" or not 0 < duration <= 30.5:
                raise ValueError("Expected one audio stream of at most 30 seconds")
            rows.append({
                "id": clip, "speaker": f"S{speaker}", "archive_path": entry.filename,
                "audio": f"audio/{clip}.ogg", "sha256": hashlib.sha256(data).hexdigest(),
                "bytes": len(data), "duration_seconds": duration,
                "codec": streams[0]["codec_name"], "sample_rate": streams[0]["sample_rate"],
                "language": samples[clip]["language"],
                "reference_transcript": samples[clip]["transcript"],
                "expected": samples[clip]["expected"],
            })
    if {row["id"] for row in rows} != set(samples):
        raise ValueError("Missing or duplicate clips")
    manifest = {
        "kind": "supplied original satay development baseline; not expanded CP7 holdout",
        "imported_at": datetime.now(timezone.utc).isoformat(),
        "consent": consent_evidence,
        "reference_now": corpus["reference_now"],
        "reference_verification": "Owner confirmed script assignments; spoken deviations not independently annotated",
        "archive_sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
        "samples": sorted(rows, key=lambda row: row["id"]),
    }
    target = folder / "manifest.json"
    if target.exists():
        raise ValueError("Manifest already exists; preserved without overwrite")
    target.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"clips": len(rows), "speakers": 5, "format": "Ogg", "folder": str(folder)}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, default=ROOT / "audio.zip")
    parser.add_argument("--folder", type=Path, default=ROOT / ".local-evaluation/supplied-satay")
    parser.add_argument("--ffprobe", type=Path, required=True)
    parser.add_argument("--consent-evidence", required=True)
    args = parser.parse_args()
    import_pack(args.archive, args.folder, args.ffprobe, args.consent_evidence)
