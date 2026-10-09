"""Private local high-accuracy transcription. No audio upload or reference-answer prompting."""

import argparse
import hashlib
import importlib.metadata
import json
import re
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel
from huggingface_hub import snapshot_download

ROOT = Path(__file__).resolve().parents[1]
MODEL = "mobiuslabsgmbh/faster-whisper-large-v3-turbo"
REVISION = "0a363e9161cbc7ed1431c9597a8ceaf0c4f78fcf"
# Vocabulary only. No expected quantity, price, clock, sample ID or script is provided to ASR.
VOCABULARY = (
    "satay ayam, nasi lemak ayam, kuih talam, popia sayur, pisang goreng, air limau, "
    "cendol, pork noodles, chicken satay, vegetable popia, fresh lime drink, "
    "batang, bungkus, potong, biji, cawan, mangkuk, ringgit, sen, kacang, "
    "santan, tepung beras, gula Melaka, kelompok, siap, petang, malam"
)


def run(args):
    folder = args.folder.resolve()
    manifest = json.loads((folder / "manifest.json").read_text(encoding="utf-8"))
    if not re.fullmatch(r"[a-z0-9-]{1,40}", args.run_label):
        raise ValueError("Invalid run label")
    target = folder / f"transcriptions-turbo-local-{args.language_policy}-{args.run_label}.json"
    if target.exists():
        raise ValueError("Existing run preserved; choose a separate collection folder")
    started = time.perf_counter()
    model_path = snapshot_download(
        MODEL,
        revision=REVISION,
        cache_dir=ROOT / ".local-voice/faster-whisper-cache",
        allow_patterns=["*.json", "*.bin", "*.txt"],
        local_files_only=args.offline,
    )
    model = WhisperModel(
        model_path, device="cpu", compute_type="int8", cpu_threads=8, local_files_only=True
    )
    data = {
        "device": "Windows desktop; faster-whisper CPU int8, not browser or phone",
        "model": f"{MODEL}@{REVISION}; faster-whisper {importlib.metadata.version('faster-whisper')}; CPU int8",
        "network": "Local audio; public pinned model download only",
        "run_date": datetime.now(timezone.utc).isoformat(),
        "model_load_ms": round((time.perf_counter() - started) * 1000),
        "language_policy": args.language_policy,
        "decoding": {
            "beam_size": 5,
            "temperature": 0,
            "vad_filter": True,
            "condition_on_previous_text": False,
            "vocabulary": VOCABULARY,
        },
        "results": [],
        "timings": [],
    }
    for sample in manifest["samples"]:
        audio = (folder / sample["audio"]).resolve()
        if (
            not audio.is_relative_to(folder)
            or not audio.is_file()
            or audio.stat().st_size > 5000000
        ):
            raise ValueError("Invalid bounded local audio file")
        expected_hash = sample.get("sha256", sample.get("audio_sha256"))
        if hashlib.sha256(audio.read_bytes()).hexdigest() != expected_hash:
            raise ValueError("Audio hash changed")
        begun = time.perf_counter()
        row = {
            "id": sample["id"],
            "recognized": "",
            "draft": None,
            "corrected": False,
            "source": "real-inference",
            "status": "failed",
        }
        pcm = None
        try:
            decoded = subprocess.run(
                [
                    str(args.ffmpeg),
                    "-v",
                    "error",
                    "-i",
                    str(audio),
                    "-t",
                    "30.5",
                    "-f",
                    "f32le",
                    "-ac",
                    "1",
                    "-ar",
                    "16000",
                    "pipe:1",
                ],
                check=True,
                capture_output=True,
                timeout=30,
            )
            pcm = np.frombuffer(decoded.stdout, dtype=np.float32).copy()
            if not len(pcm) or len(pcm) > 488000:
                raise ValueError("Recording must contain at most 30.5 seconds")
            hinted = "en" if sample["language"] == "English" else "ms"
            languages = [hinted]
            if args.language_policy == "auto":
                languages = [None]
            elif args.language_policy == "dual" and sample["language"] == "Manglish":
                languages = ["ms", "en"]
            candidates = []
            for language in languages:
                segments, info = model.transcribe(
                    pcm,
                    language=language,
                    task="transcribe",
                    beam_size=5,
                    temperature=0,
                    vad_filter=True,
                    condition_on_previous_text=False,
                    initial_prompt=VOCABULARY,
                    hotwords=VOCABULARY,
                    vad_parameters={"min_silence_duration_ms": 500},
                )
                segments = list(segments)  # Inference is lazy; consume before recording duration.
                candidates.append(
                    {
                        "language": language,
                        "detected_language": info.language,
                        "recognized": " ".join(s.text.strip() for s in segments),
                        "average_log_probability": sum(s.avg_logprob for s in segments)
                        / len(segments)
                        if segments
                        else -100,
                        "segments": [
                            {
                                "start": s.start,
                                "end": s.end,
                                "text": s.text,
                                "avg_logprob": s.avg_logprob,
                                "no_speech_prob": s.no_speech_prob,
                                "compression_ratio": s.compression_ratio,
                            }
                            for s in segments
                        ],
                    }
                )
            chosen = max(candidates, key=lambda x: x["average_log_probability"])
            row.update(
                recognized=chosen["recognized"],
                candidates=candidates,
                selected_language=chosen["language"],
                selection="Highest average decoder log probability; no script/answer used",
                status="transcribed" if chosen["recognized"].strip() else "failed",
            )
        except Exception as error:  # noqa: BLE001 - preserve every native decoder/inference failure per clip
            row["error"] = type(error).__name__ + ": " + str(error)
        finally:
            if pcm is not None:
                pcm.fill(0)
        row["speech_ms"] = round((time.perf_counter() - begun) * 1000)
        data["results"].append(row)
        target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{row['id']}: {row['status']} ({row['speech_ms']} ms)", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--folder", type=Path, default=ROOT / ".local-evaluation/supplied-satay")
    parser.add_argument("--language-policy", choices=["hinted", "auto", "dual"], default="hinted")
    parser.add_argument("--offline", action="store_true")
    parser.add_argument("--run-label", default="enhanced")
    parser.add_argument(
        "--ffmpeg",
        type=Path,
        default=ROOT / ".local-tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe",
    )
    run(parser.parse_args())
