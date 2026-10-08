"""Focused phase-end gate; guarded disposable DB and own fixture cleanup."""

import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    target_configuration()
    os.environ["RUN_LIVE_CP8"] = "1"
    raise SystemExit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "pytest",
                "apps/api/tests/test_cp8.py",
                "apps/api/tests/test_cp8_live.py",
                "-q",
                "--tb=short",
            ],
            cwd=ROOT,
        )
    )
