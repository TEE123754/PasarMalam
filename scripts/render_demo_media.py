"""Render synthetic text/diagram videos and QR posters entirely offline."""

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

import imageio_ffmpeg
import qrcode
import qrcode.image.svg
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]


def render(origin):
    url = urlsplit(origin)
    if (
        url.scheme not in ["http", "https"]
        or not url.netloc
        or url.username
        or url.password
        or url.query
        or url.fragment
        or url.path not in ("", "/")
        or not re.fullmatch(r"[A-Za-z0-9.-]+", url.hostname or "")
    ):
        raise ValueError(
            "Use a public preview origin without credentials or query data"
        )
    target = ROOT / "apps/web/public/demo/media"
    target.mkdir(parents=True, exist_ok=True)
    for n, title in enumerate(
        ["Batch time and separate preparation", "Private synthetic handling report"]
    ):
        path = target / f"training-{n + 1}.mp4"
        writer = imageio_ffmpeg.write_frames(
            str(path),
            (640, 360),
            fps=12,
            codec="libx264",
            pix_fmt_in="rgb24",
            pix_fmt_out="yuv420p",
            macro_block_size=16,
        )
        writer.send(None)
        try:
            for frame in range(96):
                im = Image.new("RGB", (640, 360), "#f8f6ec")
                d = ImageDraw.Draw(im)
                d.rectangle((0, 0, 640, 50), fill="#174c3d")
                d.text((20, 18), "PASARMALAM · SYNTHETIC TRAINING VIDEO", fill="white")
                d.text((20, 75), title, fill="#174c3d")
                d.text(
                    (20, 100),
                    "DEMO Seri Pelita · 2 Oct 2026 · 20:30 MYT",
                    fill="#174c3d",
                )
                d.rectangle((30, 150, 610, 270), outline="#174c3d", width=3)
                d.text(
                    (50, 180),
                    "Described scene placeholder · no photograph or real incident",
                    fill="#174c3d",
                )
                d.text(
                    (50, 220),
                    "Batch A 20:00 → Batch B 20:25"
                    if n == 0
                    else "Reporter → private moderator → approved summary",
                    fill="#174c3d",
                )
                d.rectangle((30, 285, 30 + int(580 * frame / 95), 298), fill="#b17433")
                d.text(
                    (30, 320),
                    f"SIMULATED · {frame / 12:.1f} / 8 sec · Not food safety evidence",
                    fill="#174c3d",
                )
                writer.send(im.tobytes())
        finally:
            writer.close()
    poster = ROOT / "apps/web/public/demo/share"
    poster.mkdir(parents=True, exist_ok=True)
    qrcode.make(
        origin.rstrip("/") + "/demo/discover",
        image_factory=qrcode.image.svg.SvgPathImage,
    ).save(str(poster / "demo-qr.svg"))
    for channel in ["WhatsApp", "Facebook", "TikTok"]:
        (poster / f"{channel.lower()}.html").write_text(
            f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>DEMO {channel} community poster</title><style>body{{font:22px system-ui;padding:30px;color:#174c3d;max-width:650px}}.slot{{padding:50px;border:2px dashed #174c3d}}img{{width:180px}}</style><h1>PasarMalam · FICTIONAL DEMO</h1><p>Kenali penjaja. Cari tawaran sebelum tutup.</p><p>Meet fictional neighbours, explore markets and preview clearance offers.</p><p class="slot">Image placeholder: lantern-lit community market. User image pending.</p><img src="demo-qr.svg" alt="QR to local demo preview"><p>Local preview destination: {origin}/demo/discover</p><p>Draft for organiser review. No real market announcement, partnership or public distribution. {channel} layout concept only. Replace preview origin before approved distribution.</p></html>',
            encoding="utf-8",
        )
    (ROOT / "docs/video-provenance.json").write_text(
        json.dumps(
            dict(
                method="Original text/diagram animation; no raster artwork generated",
                synthetic=True,
                location="Fictional Seri Pelita",
                timestamp="2026-10-02T20:30:00+08:00",
                durationSeconds=8,
                fps=12,
                files=["training-1.mp4", "training-2.mp4"],
                renderer="Pillow and imageio-ffmpeg 0.6.0; bundled FFmpeg, libx264",
                qrOrigin=origin,
            ),
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(
        "Rendered two 8-second synthetic MP4s and three fictional draft posters. No external service."
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--origin", default="http://127.0.0.1:5173")
    render(parser.parse_args().origin)
