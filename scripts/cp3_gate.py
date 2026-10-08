import os
import subprocess
import sys

from demo_db import ROOT, target_configuration

if __name__ == "__main__":
    target_configuration()
    os.environ["RUN_LIVE_CP3"] = "1"
    raise SystemExit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "pytest",
                "apps/api/tests/test_cp3.py",
                "apps/api/tests/test_cp3_live.py",
                "apps/api/tests/test_voice.py",
                "apps/api/tests/test_vendor.py",
                "-q",
                "--tb=short",
            ],
            cwd=ROOT,
        )
    )
