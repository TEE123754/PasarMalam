"""Run the live acceptance gate only when explicitly configured, never silently skip."""

import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    if os.getenv("RUN_LIVE_PHASE2") != "1":
        raise SystemExit("Set RUN_LIVE_PHASE2=1 for the disposable Supabase acceptance gate.")
    target_configuration()
    if not all(
        os.getenv(key) for key in ("DEMO_DATABASE_ID", "SUPABASE_SECRET_KEY", "DEMO_SEED_PASSWORD")
    ):
        raise SystemExit("Configure the ignored API environment file before live acceptance.")
    raise SystemExit(
        subprocess.call(
            [sys.executable, "-m", "pytest", str(ROOT / "apps/api/tests"), "-m", "live", "-q"],
            cwd=ROOT,
        )
    )
