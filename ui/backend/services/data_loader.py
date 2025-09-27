from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

import orjson
import pandas as pd


def _stats_files() -> List[Path]:
    return sorted(OUTPUT_DIR.glob("estadisticas_*.json"))


def _latest_stats() -> Path | None:
    stats = _stats_files()
    return stats[-1] if stats else None

ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT / "data"
OUTPUT_DIR = ROOT / "output"

SUMMARY_DEFAULT = {
    "clients_active": 1247,
    "monthly_revenue": 15500000,
    "manual_hours": 12,
    "operational_cost": 168000,
    "pending_cuts": 20,
    "automation_rate": 0.92,
}


def load_summary() -> Dict[str, Any]:
    summary = SUMMARY_DEFAULT.copy()
    latest = _latest_stats()
    if not latest:
        return summary

    payload = orjson.loads(latest.read_bytes())
    stats = payload.get("statistics", {})

    processed = stats.get("processed") or len(payload.get("results", []))
    successful = stats.get("successful_cuts", processed)
    failed = stats.get("failed_cuts", 0)

    if processed:
        summary["pending_cuts"] = processed
        summary["automation_rate"] = round(successful / processed, 2)
    summary["manual_hours"] = max(summary["manual_hours"] - processed * 0.2, 0)
    summary["operational_cost"] = max(summary["operational_cost"] - successful * 2500, 0)
    summary["processed_success"] = successful
    summary["processed_failures"] = failed
    summary["last_run"] = payload.get("metadata", {}).get("timestamp")
    summary["mode"] = payload.get("metadata", {}).get("mode", "dry-run")
    return summary


def load_jobs() -> List[Dict[str, Any]]:
    jobs: List[Dict[str, Any]] = []
    for stats_file in reversed(_stats_files()):
        payload = orjson.loads(stats_file.read_bytes())
        metadata = payload.get("metadata", {})
        stats = payload.get("statistics", {})
        jobs.append(
            {
                "id": stats_file.stem.replace("estadisticas_", "JOB-"),
                "timestamp": metadata.get("timestamp"),
                "mode": metadata.get("mode", "dry-run"),
                "processed": stats.get("processed", len(payload.get("results", []))),
                "skipped": stats.get("failed_cuts", 0),
                "status": "rollback" if stats.get("rollback_triggered") else "completed",
            }
        )
    if jobs:
        return jobs
    return [
        {
            "id": "JOB-demo",
            "timestamp": "2025-09-26T02:39:43",
            "mode": "dry-run",
            "processed": 20,
            "skipped": 0,
            "status": "completed",
        }
    ]


def list_reports() -> List[Dict[str, Any]]:
    reports = []
    for path in OUTPUT_DIR.glob("*.csv"):
        reports.append({
            "name": path.name,
            "path": str(path.relative_to(ROOT)),
            "size": path.stat().st_size,
        })
    return reports
