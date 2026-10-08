"""Optimise user-supplied demo artwork without modifying original files."""
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "IMAGE"
TARGET = ROOT / "apps/web/public/demo/images"


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    records = []
    for source in sorted(SOURCE.glob("pm-*.png")):
        with Image.open(source) as original:
            original.load()
            image = ImageOps.exif_transpose(original).convert("RGB")
            outputs = []
            for width, suffix in [(960, ""), (480, "-small")]:
                resized = image.copy()
                resized.thumbnail((width, width), Image.Resampling.LANCZOS)
                target = TARGET / f"{source.stem}{suffix}.webp"
                resized.save(target, "WEBP", quality=82, method=6, exif=b"")
                outputs.append({"file": target.name, "bytes": target.stat().st_size})
            records.append({
                "source": f"IMAGE/{source.name}",
                "sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                "method": "user-supplied-demo-artwork; resized and metadata-stripped",
                "generation_model": "Not provided",
                "licence": "User supplied for local demo; public-use rights confirmation pending",
                "outputs": outputs,
            })
    if len(records) != 12:
        raise ValueError("Expected the 12 user-supplied PM images")
    (ROOT / "docs/supplied-image-provenance.json").write_text(
        json.dumps(records, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Prepared {len(records)} originals / 24 responsive WebP files; originals preserved.")


if __name__ == "__main__":
    main()
