#!/usr/bin/env python3
"""Save a finished run's token count and duration (from the task notification).

Usage: record_timing.py <iteration_dir> <eval-dir-name> <config> --tokens N --ms N [--run 1]

The notification is the only place these numbers appear, so record each one as
it arrives.
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _ws import write_json  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("iteration_dir")
    ap.add_argument("eval_dir")
    ap.add_argument("config")
    ap.add_argument("--tokens", type=int, required=True)
    ap.add_argument("--ms", type=int, required=True)
    ap.add_argument("--run", type=int, default=1)
    a = ap.parse_args()
    rd = Path(a.iteration_dir) / a.eval_dir / a.config / f"run-{a.run}"
    if not rd.exists():
        sys.exit(f"record_timing: {rd} does not exist")
    write_json(rd / "timing.json", {"total_tokens": a.tokens, "duration_ms": a.ms, "total_duration_seconds": round(a.ms / 1000, 1)})
    print(f"saved {rd / 'timing.json'}")


if __name__ == "__main__":
    main()
