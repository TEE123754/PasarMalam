"""Phase 11 dataset/media validation without real data or external services."""

import json
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[3]


def test_catalog_counts_links_reviews_and_image_ids():
    c = json.loads((ROOT / "contracts/demo-catalog.json").read_text(encoding="utf-8"))
    expected = {
        "owners": 30,
        "customers": 50,
        "batches": 150,
        "reviews": 150,
        "complaints": 8,
        "organisations": 12,
        "partnerPersonas": 18,
        "mediaFeatures": 6,
        "trails": 3,
        "collaborations": 6,
        "referrals": 6,
        "inspections": 4,
        "permits": 10,
        "orders": 24,
        "reservations": 8,
        "payments": 24,
        "refunds": 6,
        "subscriptions": 8,
        "deliveries": 12,
        "collections": 8,
        "notifications": 30,
        "weather": 3,
        "aiDrafts": 6,
        "campaigns": 8,
        "offers": 12,
        "adCreatives": 6,
        "pilot": 40,
    }
    for key, count in expected.items():
        assert len(c[key]) == count
        assert len({r["id"] for r in c[key]}) == count
    d = c["discovery"]
    markets = {m["id"] for m in d["markets"]}
    stalls = {s["id"] for s in d["stalls"]}
    foods = {f["id"] for f in d["menu"]}
    assert len(markets) == 10 and len(stalls) == 30 and len(foods) == 90
    assert sum(m["type"] == "night" for m in d["markets"]) == 6
    assert sum(m["type"] == "day" for m in d["markets"]) == 4
    assert all(s["marketId"] in markets for s in d["stalls"])
    assert all(f["stallId"] in stalls for f in d["menu"])
    assert all(b["food"] in foods for b in c["batches"])
    assert all(r["stallId"] in stalls for r in c["reviews"])
    for s in d["stalls"]:
        rows = [r for r in c["reviews"] if r["stallId"] == s["id"]]
        assert s["reviews"] == len(rows)
        assert s["rating"] == sum(r["rating"] for r in rows) / len(rows)
    assets = json.loads((ROOT / "docs/asset-manifest.json").read_text(encoding="utf-8"))
    assert len(assets) == 100
    assert all(b["image"] in {a["id"] for a in assets} for b in c["batches"])
    assert all(
        a["entity"]
        in (
            markets
            if a["id"].startswith("MARKET-")
            else foods
            if a["id"].startswith("FOOD-")
            else stalls
        )
        for a in assets
        if a["id"].startswith(("MARKET-", "STALL-", "FOOD-"))
    )


def test_two_distinct_decodable_synthetic_videos():
    paths = [ROOT / f"apps/web/public/demo/media/training-{n}.mp4" for n in [1, 2]]
    assert paths[0].read_bytes() != paths[1].read_bytes()
    for path in paths:
        reader = imageio_ffmpeg.read_frames(str(path))
        meta = next(reader)
        assert abs(meta["duration"] - 8) < 0.2
        assert meta["fps"] == 12
        assert sum(1 for _ in reader) == 96


def test_catalog_builder_idempotent(tmp_path, monkeypatch):
    import shutil

    import build_demo_catalog as builder

    for part in ["contracts", "docs", "apps/web/src/presentation"]:
        (tmp_path / part).mkdir(parents=True, exist_ok=True)
    shutil.copy(
        ROOT / "contracts/discovery-fixture.json", tmp_path / "contracts/discovery-fixture.json"
    )
    shutil.copy(ROOT / "IMAGE_GENERATION_PROMPTS.md", tmp_path / "IMAGE_GENERATION_PROMPTS.md")
    monkeypatch.setattr(builder, "ROOT", tmp_path)
    builder.build()
    first = (tmp_path / "contracts/demo-catalog.json").read_bytes()
    builder.build()
    assert first == (tmp_path / "contracts/demo-catalog.json").read_bytes()
