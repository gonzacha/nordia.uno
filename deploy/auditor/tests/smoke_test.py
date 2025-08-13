#!/usr/bin/env python3
import json
import sys
import time
import traceback
import os

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app


def check(client, path, method="GET", **kwargs):
    resp = client.open(path, method=method, **kwargs)
    print(f"{method} {path} -> {resp.status_code}")
    if resp.is_json:
        try:
            print(json.dumps(resp.get_json(), indent=2)[:800])
        except Exception:
            pass
    return resp


def main():
    client = app.test_client()
    fails = 0
    try:
        r = check(client, "/api/health"); assert r.status_code == 200 and r.get_json().get("status") == "ok"
        r = check(client, "/"); assert r.status_code == 200
        r = check(client, "/api/server-info"); assert r.status_code == 200
        r = check(client, "/api/metrics"); assert r.status_code == 200
        r = check(client, "/api/stress-test", method="POST"); assert r.status_code == 200

        r = check(client, "/start-monitoring"); assert r.status_code == 200
        sid = r.get_json()["session_id"]
        time.sleep(2)
        r = check(client, "/api/metrics"); assert r.status_code == 200
        r = check(client, "/stop-monitoring"); assert r.status_code == 200
        report = r.get_json(); assert "performance_metrics" in report and "server_info" in report
        r = check(client, f"/report/{sid}"); assert r.status_code == 200
    except AssertionError:
        traceback.print_exc()
        fails += 1
    except Exception:
        traceback.print_exc()
        fails += 1

    print("SMOKE:", "OK" if fails == 0 else "FAILED")
    sys.exit(0 if fails == 0 else 1)


if __name__ == "__main__":
    main()
