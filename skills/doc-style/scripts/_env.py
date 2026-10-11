"""Shared helpers: re-exec inside the doc-style venv and locate skill files."""
import json
import os
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
ASSETS = SKILL_DIR / "assets"
PROFILES = ASSETS / "profiles"
HOME = Path(os.environ.get("DOC_STYLE_HOME") or Path(os.environ.get("XDG_CACHE_HOME") or Path.home() / ".cache") / "doc-style")
VENV_PY = HOME / "venv" / "bin" / "python"
NODE_MODULES = HOME / "node" / "node_modules"


def ensure_venv(*modules: str) -> None:
    """Re-run the current script with the venv python if modules are missing."""
    try:
        for m in modules:
            __import__(m)
    except ImportError:
        # Compare prefixes, not resolved executables: a venv's python is often
        # a symlink to the system python, so the resolved paths are equal.
        in_venv = Path(sys.prefix).resolve() == (HOME / "venv").resolve()
        if VENV_PY.exists() and not in_venv and not os.environ.get("DOC_STYLE_REEXEC"):
            os.environ["DOC_STYLE_REEXEC"] = "1"
            os.execv(str(VENV_PY), [str(VENV_PY), *sys.argv])
        sys.exit(f"doc-style: missing Python modules {modules}. Run {SKILL_DIR}/scripts/setup.sh first.")


def load_profile(name_or_path: str) -> dict:
    p = Path(name_or_path)
    if not p.exists():
        p = PROFILES / f"{name_or_path}.json"
    if not p.exists():
        names = ", ".join(x.stem for x in PROFILES.glob("*.json"))
        sys.exit(f"doc-style: unknown profile {name_or_path!r} (available: {names})")
    return json.loads(p.read_text())


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def palette(profile: dict) -> dict[str, tuple[int, int, int]]:
    pal = {role: hex_to_rgb(v) for role, v in profile["colors"].items()}
    for i, v in enumerate(profile.get("chart_palette", [])):
        pal[f"chart_{i}"] = hex_to_rgb(v)
    pal.setdefault("white", (255, 255, 255))
    return pal


def nearest_role(rgb: tuple[int, int, int], pal: dict, tol: int = 6) -> str | None:
    best, dist = None, 10**9
    for role, c in pal.items():
        dd = max(abs(a - b) for a, b in zip(rgb, c))
        if dd < dist:
            best, dist = role, dd
    return best if dist <= tol else None
