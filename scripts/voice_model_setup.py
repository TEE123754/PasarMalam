"""Download pinned official local inference assets; no global install or API key."""

import hashlib
import json
import platform
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = json.loads(
    (ROOT / "contracts/local-llm-runtime.json").read_text(encoding="utf-8")
)
MODEL = json.loads((ROOT / "contracts/speech-model.json").read_text(encoding="utf-8"))
CACHE = ROOT / ".local-voice"


def download(url: str, target: Path, digest: str, size: int):
    if target.exists():
        with target.open("rb") as cached:
            if hashlib.file_digest(cached, "sha256").hexdigest() == digest:
                print(f"Verified cached {target.name}", flush=True)
                return
    partial = target.with_suffix(target.suffix + ".partial")
    checksum = hashlib.sha256()
    received = 0
    with (
        urllib.request.urlopen(url, timeout=30) as response,
        partial.open("wb") as output,
    ):
        while chunk := response.read(1024 * 1024):
            received += len(chunk)
            if received > size:
                raise ValueError("Artifact larger than pinned size")
            output.write(chunk)
            checksum.update(chunk)
    if received != size or checksum.hexdigest() != digest:
        raise ValueError("Artifact hash/size mismatch; refusing execution")
    partial.replace(target)
    print(f"Verified {target.name}: {received} bytes", flush=True)


def setup():
    if platform.system() != "Windows" or platform.machine().lower() not in {
        "amd64",
        "x86_64",
    }:
        raise ValueError("This pinned runtime is Windows x64 only")
    CACHE.mkdir(exist_ok=True)
    archive = CACHE / "runtime.zip"
    download(RUNTIME["url"], archive, RUNTIME["sha256"], RUNTIME["bytes"])
    runtime = CACHE / RUNTIME["version"]
    runtime.mkdir(exist_ok=True)
    with zipfile.ZipFile(archive) as bundle:
        for member in bundle.infolist():
            if (
                not (runtime / member.filename)
                .resolve()
                .is_relative_to(runtime.resolve())
            ):
                raise ValueError("Unsafe archive path")
            if (member.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError("Archive symlink rejected")
        bundle.extractall(runtime)
    url = f"https://huggingface.co/{MODEL['llm']}/resolve/{MODEL['llm_revision']}/{MODEL['llm_file']}"
    download(
        url, CACHE / MODEL["llm_file"], RUNTIME["model_sha256"], RUNTIME["model_bytes"]
    )
    print(
        "Ready. Run scripts/start-voice-model.ps1; server is loopback-only.", flush=True
    )


if __name__ == "__main__":
    setup()
