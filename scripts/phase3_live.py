"""Explicitly configured Phase 3 live boundary checks; browser latency is separate."""

import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    if os.getenv("RUN_LIVE_PHASE3") != "1":
        raise SystemExit("Set RUN_LIVE_PHASE3=1 for the disposable Supabase gate.")
    target_configuration()
    if not all(
        os.getenv(key) for key in ("DEMO_DATABASE_ID", "SUPABASE_SECRET_KEY", "DEMO_SEED_PASSWORD")
    ):
        raise SystemExit("Configure the ignored API environment file before live acceptance.")
    raise SystemExit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "pytest",
                str(ROOT / "apps/api/tests/test_phase3_live.py"),
                "-q",
            ],
            cwd=ROOT,
        )
    )
