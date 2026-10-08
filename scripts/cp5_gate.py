import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    target_configuration()
    os.environ["RUN_LIVE_CP5"] = "1"
    raise SystemExit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "pytest",
                "apps/api/tests/test_cp5.py",
                "apps/api/tests/test_cp5_live.py",
                "apps/api/tests/test_commerce.py",
                "-q",
                "--tb=short",
            ],
            cwd=ROOT,
        )
    )
