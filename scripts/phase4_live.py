"""Explicit live Phase 4 gate; missing environment is a failure, never a mock pass."""

import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    if os.getenv("RUN_LIVE_PHASE4") != "1":
        raise SystemExit(
            "Set RUN_LIVE_PHASE4=1 after applying migration 006 and media setup."
        )
    target_configuration()
    if not all(
        os.getenv(key)
        for key in (
            "DEMO_DATABASE_ID",
            "SUPABASE_SECRET_KEY",
            "DEMO_SEED_PASSWORD",
            "MEDIA_SIGNING_SECRET",
        )
    ):
        raise SystemExit(
            "Configure the ignored disposable API/operator environment first."
        )
    raise SystemExit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "pytest",
                str(ROOT / "apps/api/tests/test_phase4_live.py"),
                "-q",
            ],
            cwd=ROOT,
        )
    )
