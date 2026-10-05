"""Explicit guarded live gate: missing configuration fails rather than returning a mock pass."""

import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    if os.getenv("RUN_LIVE_PHASE6") != "1":
        raise SystemExit(
            "Set RUN_LIVE_PHASE6=1 after guarded migrations 009–010 and previous live gates."
        )
    target_configuration()
    if not all(
        os.getenv(k)
        for k in ("DEMO_DATABASE_ID", "SUPABASE_SECRET_KEY", "DEMO_SEED_PASSWORD")
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
                str(ROOT / "apps/api/tests/test_phase6_live.py"),
                "-q",
            ],
            cwd=ROOT,
        )
    )
