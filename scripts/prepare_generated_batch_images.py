"""Convert generated originals to responsive WebP assets; preserve original photos."""
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "apps/web/public/demo/images"


def main() -> None:
    records = json.loads((ROOT / "docs/generated-batch-image-prompts.json").read_text(encoding="utf-8"))
    provenance = []
    previews = []
    for record in records:
        source = ROOT / record["source"]
        key = record["key"]
        stem = "market-community-pickup" if key == "community" else key if key.startswith("person-") else f"batch-{key}-{record['variant']}"
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            outputs = []
            for width, suffix in [(960, ""), (480, "-small")]:
                resized = image.copy()
                resized.thumbnail((width, width), Image.Resampling.LANCZOS)
                target = TARGET / f"{stem}{suffix}.webp"
                resized.save(target, "WEBP", quality=80, method=6, exif=b"")
                if target.stat().st_size >= 250000:
                    resized.save(target, "WEBP", quality=68, method=6, exif=b"")
                outputs.append({"file": target.name, "bytes": target.stat().st_size})
            tile = Image.new("RGB", (220, 242), "white")
            tile.paste(ImageOps.fit(image, (220, 220)), (0, 0))
            ImageDraw.Draw(tile).text((8, 226), f"{key} / {record['variant']}", fill="black")
            previews.append(tile)
        provenance.append({**record, "sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "method": "built-in imagegen; responsive WebP conversion, metadata stripped", "usage": "fictional sample imagery; never original real-world batch evidence", "outputs": outputs})
    (ROOT / "docs/generated-batch-image-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    proof_dir = ROOT / ".local-acceptance"
    proof_dir.mkdir(exist_ok=True)
    for page, offset in enumerate(range(0, len(previews), 18), 1):
        cells = previews[offset:offset + 18]
        proof = Image.new("RGB", (1320, 242 * ((len(cells) + 5) // 6)), "white")
        for index, tile in enumerate(cells):
            proof.paste(tile, ((index % 6) * 220, (index // 6) * 242))
        proof.save(proof_dir / f"batch-photo-proof-{page}.jpg")
    print(f"Prepared {len(records)} generated originals / {len(records) * 2} responsive WebP files.")


if __name__ == "__main__":
    main()
