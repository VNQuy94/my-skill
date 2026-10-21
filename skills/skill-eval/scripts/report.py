#!/usr/bin/env python3
"""Summarise an iteration into report.md (and optionally record it in the skill).

Usage: report.py <iteration_dir> [--record] [--note TEXT]

report.md has: per-eval table (pass rate per config), per-config averages of
pass rate, rubric scores, tokens and time, grader preferences, defects, and a
noise warning when there is only one run per cell.
--record copies it to <skill>/evals/results-<date>.md (review it first).
"""
import argparse
import statistics as st
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _ws import read_json, run_dirs  # noqa: E402


def fmt(x, pct=False):
    if x is None:
        return "–"
    return f"{x:.0%}" if pct else (f"{x:.1f}" if isinstance(x, float) else str(x))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("iteration_dir")
    ap.add_argument("--record", action="store_true")
    ap.add_argument("--note", default="", help="extra text appended under 'Ghi chú'")
    a = ap.parse_args()
    it = Path(a.iteration_dir).resolve()
    cfg = read_json(it / "config.json", {})

    cells = defaultdict(list)  # (eval, config) -> [grading]
    per_config = defaultdict(lambda: defaultdict(list))
    defects = defaultdict(list)
    prefs = defaultdict(int)
    configs, evals = [], []
    for ed, config, rd in run_dirs(it):
        g = read_json(rd / "grading.json")
        t = read_json(rd / "timing.json", {})
        if config not in configs:
            configs.append(config)
        if ed.name not in evals:
            evals.append(ed.name)
        if not g:
            continue
        cells[(ed.name, config)].append(g)
        pc = per_config[config]
        if g["summary"]["pass_rate"] is not None:
            pc["pass_rate"].append(g["summary"]["pass_rate"])
        for k, v in g.get("scores", {}).items():
            if isinstance(v, (int, float)):
                pc[f"score:{k}"].append(v)
        if t:
            pc["tokens"].append(t.get("total_tokens"))
            pc["seconds"].append(t.get("total_duration_seconds"))
        prefs[config] += bool(g.get("preferred"))
        defects[config] += [f"{ed.name}: {d}" for d in g.get("defects", [])]

    runs_per_cell = max((len(v) for v in cells.values()), default=0)
    lines = [f"# Kết quả kiểm thử — {it.parent.name} / {it.name}", ""]
    if cfg.get("date"):
        lines.append(f"Ngày: {cfg['date']} · cấu hình: {', '.join(configs)} · {runs_per_cell} lượt mỗi ô · chấm mù")
        lines.append("")
    lines += ["## Theo từng câu (tỉ lệ đạt tiêu chí)", "", "| Câu | " + " | ".join(configs) + " |", "|---|" + "---|" * len(configs)]
    for e in evals:
        row = []
        for c in configs:
            gs = cells.get((e, c), [])
            if not gs:
                row.append("–")
                continue
            p = sum(g["summary"]["passed"] for g in gs)
            tot = sum(g["summary"]["total"] for g in gs)
            star = " ★" if any(g.get("preferred") for g in gs) else ""
            row.append(f"{p}/{tot}{star}")
        lines.append(f"| {e} | " + " | ".join(row) + " |")
    lines += ["", "★ = người chấm thích bản này hơn ở câu đó.", "", "## Trung bình theo cấu hình", ""]
    metrics = sorted({k for pc in per_config.values() for k in pc}, key=lambda k: (k != "pass_rate", k.startswith("score:") is False, k))
    lines += ["| Chỉ số | " + " | ".join(configs) + " |", "|---|" + "---|" * len(configs)]
    for m in metrics:
        vals = []
        for c in configs:
            xs = [x for x in per_config[c].get(m, []) if x is not None]
            vals.append(fmt(st.mean(xs), pct=(m == "pass_rate")) if xs else "–")
        name = {"pass_rate": "Tỉ lệ đạt", "tokens": "Token", "seconds": "Thời gian (giây)"}.get(m, m.replace("score:", "Điểm "))
        lines.append(f"| {name} | " + " | ".join(vals) + " |")
    lines.append(f"| Số lần được chọn | " + " | ".join(str(prefs[c]) for c in configs) + " |")
    lines += ["", "## Lỗi người chấm ghi nhận", ""]
    for c in configs:
        if defects[c]:
            lines.append(f"**{c}**")
            lines += [f"- {d}" for d in defects[c]]
            lines.append("")
    lines += ["## Ghi chú", ""]
    if runs_per_cell < 3:
        lines.append(f"- Mỗi ô chỉ có {runs_per_cell} lượt chạy: chênh lệch 1 tiêu chí nằm trong mức nhiễu. Cần ≥3 lượt để kết luận khác biệt nhỏ.")
    if a.note:
        lines.append(f"- {a.note}")
    out = it / "report.md"
    out.write_text("\n".join(lines) + "\n")
    print(out.read_text())
    if a.record:
        skill = Path(cfg["skill"])
        dest = skill / "evals" / f"results-{cfg.get('date', 'undated')}.md"
        dest.write_text(out.read_text())
        print(f"recorded → {dest}")


if __name__ == "__main__":
    main()
