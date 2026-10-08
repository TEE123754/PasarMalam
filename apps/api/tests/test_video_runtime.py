"""Actual transcoder acceptance, skipped when the optional local tools are absent."""

import json
import shutil
import subprocess

import pytest
from app.community import normalize_video
from fastapi import HTTPException

pytestmark = pytest.mark.skipif(
    not shutil.which("ffmpeg") or not shutil.which("ffprobe"),
    reason="Install the verified optional media runtime first",
)


def make_clip(path, duration):
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-nostdin",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=white:size=64x64:rate=24",
            "-f",
            "lavfi",
            "-i",
            "anullsrc=r=44100:cl=mono",
            "-t",
            str(duration),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-metadata",
            "comment=PRIVATE-TEST-METADATA",
            str(path),
        ],
        check=True,
        capture_output=True,
        timeout=20,
    )
    return path.read_bytes()


def test_actual_video_sanitization_removes_audio_and_private_metadata(tmp_path):
    result = normalize_video(make_clip(tmp_path / "source.mp4", 2))
    output = tmp_path / "result.mp4"
    output.write_bytes(result)
    info = json.loads(
        subprocess.run(
            ["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(output)],
            check=True,
            capture_output=True,
            timeout=10,
        ).stdout
    )
    assert [s["codec_type"] for s in info["streams"]] == ["video"]
    assert info["streams"][0]["codec_name"] == "h264"
    assert float(info["format"]["duration"]) <= 10
    assert len(result) <= 5242880
    assert "PRIVATE-TEST-METADATA" not in json.dumps(info)


def test_actual_video_rejects_excess_duration(tmp_path):
    with pytest.raises(HTTPException) as rejected:
        normalize_video(make_clip(tmp_path / "too-long.mp4", 11))
    assert rejected.value.status_code == 422


def test_actual_probe_rejects_forged_mp4_bytes():
    with pytest.raises(HTTPException) as rejected:
        normalize_video(b"\x00\x00\x00\x18ftyp" + b"forged" * 20)
    assert rejected.value.status_code == 422
