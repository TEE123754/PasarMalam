"""Optional loopback-only desktop transcription; audio is never saved or uploaded."""

import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import numpy as np
from faster_whisper import WhisperModel
from huggingface_hub import snapshot_download
from transcribe_recordings_local import MODEL, REVISION, ROOT, VOCABULARY

ORIGINS = {
    f"http://{host}:{port}" for host in ["127.0.0.1", "localhost"] for port in [5173, 5174, 5175]
}
CAPACITY = threading.Lock()


def infer(model, pcm, language):
    candidates = []
    for candidate_language in ["ms", "en"] if language == "mixed" else [language]:
        segments, _ = model.transcribe(
            pcm,
            language=candidate_language,
            task="transcribe",
            beam_size=5,
            temperature=0,
            vad_filter=True,
            condition_on_previous_text=False,
            initial_prompt=VOCABULARY,
            hotwords=VOCABULARY,
            vad_parameters={"min_silence_duration_ms": 500},
        )
        segments = list(segments)
        candidates.append(
            {
                "language": candidate_language,
                "text": " ".join(s.text.strip() for s in segments),
                "score": sum(s.avg_logprob for s in segments) / len(segments) if segments else -100,
            }
        )
    chosen = max(candidates, key=lambda row: row["score"])
    if not chosen["text"].strip():
        raise ValueError("No audible speech. Record again or use text entry.")
    return {
        "text": chosen["text"],
        "selected_language": chosen["language"],
        "model": MODEL,
        "revision": REVISION,
    }


class Handler(BaseHTTPRequestHandler):
    model = None

    def log_message(self, *_):
        pass  # Never log audio, transcripts or HTTP request data.

    def allowed(self):
        return self.headers.get("Origin") in ORIGINS and self.headers.get("Host") in {
            "127.0.0.1:8020",
            "localhost:8020",
        }

    def reply(self, status, value):
        encoded = json.dumps(value).encode()
        self.send_response(status)
        if self.headers.get("Origin") in ORIGINS:
            self.send_header("Access-Control-Allow-Origin", self.headers["Origin"])
            self.send_header("Vary", "Origin")
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        try:
            self.wfile.write(encoded)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass

    def do_OPTIONS(self):
        if not self.allowed():
            self.reply(403, {"error": "Local app origin required"})
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", self.headers["Origin"])
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Speech-Language")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Vary", "Origin")
        self.end_headers()

    def do_GET(self):
        if not self.allowed() or self.path != "/status":
            self.reply(403, {"error": "Local app origin required"})
            return
        self.reply(200, {"ready": True, "model": MODEL, "revision": REVISION})

    def do_POST(self):
        if not self.allowed() or self.path != "/transcribe":
            self.reply(403, {"error": "Local app origin required"})
            return
        language = self.headers.get("X-Speech-Language")
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if (
            language not in {"ms", "en", "mixed"}
            or self.headers.get("Content-Type") != "application/octet-stream"
            or not 0 < length <= 1920000
            or length % 4
        ):
            self.reply(422, {"error": "Bounded mono 16 kHz PCM and explicit language required"})
            return
        if not CAPACITY.acquire(blocking=False):
            self.reply(429, {"error": "Desktop speech is busy; try again"})
            return
        pcm = None
        encoded = bytearray()
        try:
            self.connection.settimeout(10)
            encoded = bytearray(self.rfile.read(length))
            if len(encoded) != length:
                raise ValueError("Incomplete audio")
            pcm = np.frombuffer(encoded, dtype="<f4").copy()
            encoded[:] = b"\0" * len(encoded)
            if not np.isfinite(pcm).all() or np.max(np.abs(pcm)) > 2:
                raise ValueError("Invalid audio samples")
            self.reply(200, infer(self.model, pcm, language))
        except (ValueError, OSError, RuntimeError):
            self.reply(503, {"error": "Desktop speech unavailable; record again or use text entry"})
        finally:
            if pcm is not None:
                pcm.fill(0)
            encoded[:] = b"\0" * len(encoded)
            CAPACITY.release()


if __name__ == "__main__":
    # Model must be installed first by the evaluation script; no downloads inside requests.
    location = snapshot_download(
        MODEL,
        revision=REVISION,
        cache_dir=ROOT / ".local-voice/faster-whisper-cache",
        allow_patterns=["*.json", "*.bin", "*.txt"],
        local_files_only=True,
    )
    Handler.model = WhisperModel(
        location, device="cpu", compute_type="int8", cpu_threads=8, local_files_only=True
    )
    server = ThreadingHTTPServer(("127.0.0.1", 8020), Handler)
    server.daemon_threads = True
    print("Desktop speech ready at 127.0.0.1:8020; no audio storage or external upload", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
