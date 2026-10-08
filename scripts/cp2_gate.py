"""Run the single CP2 phase-end backend gate on a guarded disposable target."""

import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    target_configuration()
    os.environ["RUN_LIVE_CP2"] = "1"
    os.environ["RUN_LIVE_CP1"] = "1"
    raise SystemExit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "pytest",
                "apps/api/tests/test_cp2.py",
                "apps/api/tests/test_cp2_live.py",
                "apps/api/tests/test_cp1.py",
                "apps/api/tests/test_cp1_live.py",
                "apps/api/tests/test_vendor.py",
                "-q",
            ],
            cwd=ROOT,
        )
    )
