"""Placeholder for reporting integrations.

This module can later wrap the existing CLI scripts so the web UI can trigger
processes without duplicating business logic."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SCRIPTS_DIR = ROOT / "scripts"


def script_path(name: str) -> Path:
    return SCRIPTS_DIR / name
