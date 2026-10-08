"""One explicit end-of-build connected gate; no seeding into an unchecked target."""

import argparse
import os
import subprocess
import sys
import xml.etree.ElementTree as ET

import psycopg
from demo_db import ROOT, target_configuration, verify_marker


def main(failed=False, edges=False):
    _, _, database = target_configuration()
    with psycopg.connect(database, connect_timeout=10) as db:
        verify_marker(db)
    settings = os.environ.copy()
    for phase in range(2, 12):
        settings[f"RUN_LIVE_PHASE{phase}"] = "1"
    files = ["test_live_permissions.py"] + [
        f"test_phase{phase}_live.py" for phase in range(3, 12)
    ] + ["test_connected_edges.py"]
    if edges:
        files = ["test_connected_edges.py", "test_phase11_live.py"]
    directory = ROOT / ".local-acceptance"
    directory.mkdir(exist_ok=True)
    report = directory / "connected.xml"
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "pytest",
            *[str(ROOT / "apps/api/tests" / f) for f in files],
            "-q",
            "--basetemp",
            str(ROOT / ".local-acceptance/pytest"),
            "--tb=short",
            "--junitxml",
            str(report),
            *(["--lf"] if failed else []),
        ],
        cwd=ROOT,
        env=settings,
        capture_output=True,
        text=True,
    )
    # Full traces may contain session tokens; keep them in ignored local evidence only.
    (directory / "connected.log").write_text(result.stdout + result.stderr)
    if report.exists():
        for suite in ET.parse(report).getroot().iter("testsuite"):
            print("Connected results:", {k: suite.get(k) for k in
                  ["tests", "failures", "errors", "skipped"]})
        for case in ET.parse(report).getroot().iter("testcase"):
            if case.find("failure") is not None or case.find("error") is not None:
                print("Failed:", case.get("name"))
    return result.returncode


if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser()
        parser.add_argument("--failed", action="store_true")
        parser.add_argument("--edges", action="store_true")
        arguments = parser.parse_args()
        raise SystemExit(main(arguments.failed, arguments.edges))
    except (ValueError, psycopg.Error):
        raise SystemExit(
            "Connected gate unavailable: configure the matching disposable database and migrations first"
        ) from None
