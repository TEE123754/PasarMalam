import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    target_configuration()
    os.environ["RUN_LIVE_CP4"] = "1"
    raise SystemExit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "pytest",
                "apps/api/tests/test_cp4.py",
                "apps/api/tests/test_cp4_live.py",
                "apps/api/tests/test_freshness.py",
                "-q",
                "--tb=short",
            ],
            cwd=ROOT,
        )
    )
