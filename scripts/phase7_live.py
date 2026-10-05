"""Run only explicitly enabled, guarded disposable Phase 7 acceptance."""

import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    if os.getenv("RUN_LIVE_PHASE7") != "1":
        raise SystemExit(
            "Set RUN_LIVE_PHASE7=1 after guarded migrations through 011 and prior gates."
        )
    target_configuration()
    if not all(
        os.getenv(k)
        for k in ("DEMO_DATABASE_ID", "SUPABASE_SECRET_KEY", "DEMO_SEED_PASSWORD")
    ):
        raise SystemExit("Configure the ignored disposable operator environment first.")
    raise SystemExit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "pytest",
                str(ROOT / "apps/api/tests/test_phase7_live.py"),
                "-q",
            ],
            cwd=ROOT,
        )
    )
