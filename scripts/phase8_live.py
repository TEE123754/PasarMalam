"""Run only explicitly enabled, guarded disposable Phase 8 acceptance."""

import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    if os.getenv("RUN_LIVE_PHASE8") != "1":
        raise SystemExit(
            "Set RUN_LIVE_PHASE8=1 after guarded migrations through the commerce migration and prior gates."
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
                str(ROOT / "apps/api/tests/test_phase8_live.py"),
                "-q",
            ],
            cwd=ROOT,
        )
    )
