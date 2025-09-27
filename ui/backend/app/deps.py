from functools import lru_cache
from pathlib import Path
from typing import Dict

from fastapi import Depends, Request
import orjson

THEMES_DIR = Path(__file__).resolve().parents[2] / "frontend" / "public" / "themes"
DEFAULT_THEME = THEMES_DIR / "default.json"


@lru_cache(maxsize=32)
def _load_theme(path: Path) -> Dict:
    if not path.exists():
        raise FileNotFoundError(path)
    return orjson.loads(path.read_bytes())


def get_brand_config(request: Request) -> Dict:
    tenant = getattr(request.state, "tenant", "default")
    theme_path = THEMES_DIR / f"{tenant}.json"
    if not theme_path.exists():
        theme_path = DEFAULT_THEME
    return _load_theme(theme_path)


def get_brand_with_request(request: Request, brand=Depends(get_brand_config)):
    return brand
