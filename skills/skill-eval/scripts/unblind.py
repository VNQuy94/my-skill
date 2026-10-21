#!/usr/bin/env python3
"""Copy blind grades back to each run as grading.json.

Usage: unblind.py <iteration_dir>

Reads blind/<eval>/grades.json and blind_mapping.json, and writes
<run_dir>/grading.json with expectations, summary, scores, defects, and
whether the grader preferred that run.
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _ws import read_json, write_json  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("iteration_dir")
    a = ap.parse_args()
    it = Path(a.iteration_dir).resolve()
    mapping = read_json(it / "blind_mapping.json")
    if not mapping:
        sys.exit("unblind: blind_mapping.json missing — run blind.py first")
    missing = []
    for key, run_rel in mapping.items():
        eval_name, letter = key.split("/")
        grades = read_json(it / "blind" / eval_name / "grades.json")
        if not grades or letter not in grades.get("runs", {}):
            missing.append(key)
            continue
        g = grades["runs"][letter]
        exp = g.get("expectations", [])
        passed = sum(1 for x in exp if x.get("passed"))
        write_json(it / run_rel / "grading.json", {
            "expectations": exp,
            "summary": {"passed": passed, "failed": len(exp) - passed, "total": len(exp),
                        "pass_rate": round(passed / len(exp), 3) if exp else None},
            "scores": g.get("scores", {}),
            "defects": g.get("defects", []),
            "preferred": grades.get("preferred") == letter,
            "grader_why": grades.get("why", ""),
        })
    if missing:
        print("no grades for: " + ", ".join(missing))
    print(f"wrote grading.json for {len(mapping) - len(missing)} run(s)")
    sys.exit(1 if missing else 0)


if __name__ == "__main__":
    main()
