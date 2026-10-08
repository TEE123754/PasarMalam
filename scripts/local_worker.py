"""Local minute dispatcher and hourly operator sweep; never deploys or logs secrets."""

import argparse
import os
import time
from urllib.parse import urlparse

import httpx
from demo_db import target_configuration
from media_sweep import sweep


def run(once=False):
    target_configuration()
    url = os.getenv("AGENT_DISPATCH_URL", "")
    parsed = urlparse(url)
    if (
        parsed.scheme != "http"
        or parsed.hostname not in {"127.0.0.1", "localhost"}
        or parsed.path != "/api/v1/agent/dispatch"
        or parsed.query
        or parsed.fragment
        or parsed.username
        or parsed.password
    ):
        raise ValueError("Local worker requires the loopback agent dispatch URL")
    secret = os.getenv("AGENT_DISPATCH_SECRET", "")
    if len(secret) < 32:
        raise ValueError("Run local runtime setup first")
    next_sweep = 0.0
    while True:
        started = time.monotonic()
        try:
            with httpx.Client(timeout=55, follow_redirects=False) as client:
                response = client.post(url, headers={"X-Agent-Secret": secret}, json={})
                print(f"Local dispatcher HTTP {response.status_code}", flush=True)
        except httpx.HTTPError:
            print("Local dispatcher unavailable; retry on next minute", flush=True)
        if started >= next_sweep:
            try:
                sweep(apply=True)
            except Exception:
                print("Guarded media sweep unavailable; retry in one hour", flush=True)
            next_sweep = started + 3600
        if once:
            return
        time.sleep(max(1, 60 - (time.monotonic() - started)))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true")
    try:
        run(parser.parse_args().once)
    except KeyboardInterrupt:
        print("Local worker stopped; uncompleted queue leases remain recoverable.")
