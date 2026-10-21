"""Shared helpers for skill-eval scripts (stdlib only)."""
import json
import sys
from pathlib import Path

SKILL_EVAL_DIR = Path(__file__).resolve().parent.parent
# skill-eval lives in <repo>/skills/skill-eval; results go to <repo>/workspaces/
REPO = SKILL_EVAL_DIR.parent.parent
CONFIG_LETTERS = "ABCDEFGH"


def load_evals(skill_dir: Path) -> dict:
    f = skill_dir / "evals" / "evals.json"
    if not f.exists():
        sys.exit(f"skill-eval: {f} not found. Write evals first (see references/evals-format.md).")
    data = json.loads(f.read_text())
    for e in data.get("evals", []):
        for key in ("id", "name", "prompt", "assertions"):
            if key not in e:
                sys.exit(f"skill-eval: eval {e.get('id', '?')} is missing '{key}'")
    return data


def workspace(skill_name: str, iteration: int, root: Path | None = None) -> Path:
    return (root or REPO / "workspaces") / skill_name / f"iteration-{iteration}"


def eval_dirname(e: dict) -> str:
    return f"eval-{e['id']}-{e['name']}"


def run_dirs(iteration_dir: Path):
    """Yield (eval_dir, config, run_dir) for every run-* folder."""
    for ed in sorted(iteration_dir.glob("eval-*")):
        for cd in sorted(p for p in ed.iterdir() if p.is_dir() and p.name not in ("blind",)):
            for rd in sorted(cd.glob("run-*")):
                yield ed, cd.name, rd


def read_json(p: Path, default=None):
    try:
        return json.loads(p.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json(p: Path, data) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
