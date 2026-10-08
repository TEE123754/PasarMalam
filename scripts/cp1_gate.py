"""One explicit CP1 backend gate, including guarded connected acceptance."""

import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    target_configuration()  # Refuse wrong/unconfigured project rather than silently skipping.
    os.environ["RUN_LIVE_CP1"] = "1"
    raise SystemExit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "pytest",
                "apps/api/tests/test_cp1.py",
                "apps/api/tests/test_cp1_live.py",
                "apps/api/tests/test_vendor.py",
                "-q",
            ],
            cwd=ROOT,
        )
    )
