#!/usr/bin/env python3
"""Blind the outputs of an iteration for grading, and write grader prompts.

Usage: blind.py <iteration_dir> [--seed N] [--dpi 70]

For every eval, each run's outputs are copied to blind/<eval>/<letter>/ in a
shuffled order. PDFs are also rendered to page PNGs (pdftoppm), and DOCX files
too when LibreOffice is available, so the grader can look at them.
The letter → config mapping goes to <iteration_dir>/blind_mapping.json, which
the grader must not read. Grader prompts go to prompts/grade--<eval>.txt.
"""
import argparse
import random
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _ws import CONFIG_LETTERS, SKILL_EVAL_DIR, read_json, write_json  # noqa: E402


W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def docx_structure(src: Path, out: Path) -> None:
    """Plain-text dump of a .docx (stdlib only) so graders can inspect it without python-docx."""
    import xml.etree.ElementTree as ET

    with zipfile.ZipFile(src) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    lines = []
    body = root.find(W + "body")
    for el in body:
        tag = el.tag.replace(W, "")
        if tag == "p":
            ps = el.find(f"{W}pPr/{W}pStyle")
            num = el.find(f"{W}pPr/{W}numPr")
            text = "".join(t.text or "" for t in el.iter(W + "t"))
            runs = []
            for r in el.iter(W + "r"):
                rpr = r.find(W + "rPr")
                if rpr is not None:
                    d = {k: rpr.find(W + k).get(W + "val") for k in ("color", "sz") if rpr.find(W + k) is not None}
                    if rpr.find(W + "rFonts") is not None:
                        d["font"] = rpr.find(W + "rFonts").get(W + "ascii")
                    if rpr.find(W + "b") is not None:
                        d["bold"] = True
                    if d:
                        runs.append(d)
            style = ps.get(W + "val") if ps is not None else "Normal"
            lines.append(f"[P style={style}{' list' if num is not None else ''}] {text}" + (f"  runs={runs}" if runs else ""))
        elif tag == "tbl":
            rows = el.findall(W + "tr")
            lines.append(f"[TABLE {len(rows)} rows]")
            for i, tr in enumerate(rows):
                cells = []
                for tc in tr.findall(W + "tc"):
                    shd = tc.find(f"{W}tcPr/{W}shd")
                    fill = shd.get(W + "fill") if shd is not None else None
                    txt = "".join(t.text or "" for t in tc.iter(W + "t"))
                    cells.append(f"{txt}" + (f" (fill {fill})" if fill else ""))
                lines.append(f"  row {i}: " + " | ".join(cells))
    out.write_text("\n".join(lines) + "\n")


def render(src: Path, dst: Path, dpi: int) -> None:
    if src.suffix == ".docx" and shutil.which("soffice"):
        subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(dst), str(src)],
                       capture_output=True)
        src = dst / (src.stem + ".pdf")
    if src.suffix == ".pdf" and src.exists() and shutil.which("pdftoppm"):
        subprocess.run(["pdftoppm", "-png", "-r", str(dpi), str(src), str(dst / f"{src.stem}-page")], check=False)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("iteration_dir")
    ap.add_argument("--seed", type=int)
    ap.add_argument("--dpi", type=int, default=70)
    a = ap.parse_args()
    it = Path(a.iteration_dir).resolve()
    rng = random.Random(a.seed)
    blind = it / "blind"
    if blind.exists():
        shutil.rmtree(blind)
    template = (SKILL_EVAL_DIR / "references" / "grader-prompt.md").read_text()
    mapping: dict[str, str] = {}

    for ed in sorted(it.glob("eval-*")):
        runs = [rd for cd in sorted(ed.iterdir()) if cd.is_dir() for rd in sorted(cd.glob("run-*"))]
        runs = [rd for rd in runs if (rd / "outputs").exists() and any((rd / "outputs").iterdir())]
        if len(runs) < 2:
            print(f"skip {ed.name}: fewer than 2 finished runs")
            continue
        rng.shuffle(runs)
        letters = CONFIG_LETTERS[: len(runs)]
        meta = read_json(ed / "eval_metadata.json", {})
        deliverable = meta.get("deliverable")
        log = meta.get("log", "sources")
        for letter, rd in zip(letters, runs):
            dst = blind / ed.name / letter
            dst.mkdir(parents=True)
            # Copy only what the user would receive. Build sources, configs and
            # command logs reveal how the output was made, which un-blinds it.
            if deliverable and (rd / "outputs" / deliverable).is_dir():
                # A folder deliverable (e.g. screenshots + a neutral checks.json for UI work):
                # copy its viewable files only, never sources that reveal the config.
                for f in sorted((rd / "outputs" / deliverable).rglob("*")):
                    if f.is_file() and f.suffix in (".png", ".jpg", ".json", ".md", ".txt", ".pdf"):
                        shutil.copy(f, dst / f.name)
                mapping[f"{ed.name}/{letter}"] = str(rd.relative_to(it))
                continue
            keep = [rd / "outputs" / deliverable] if deliverable else [
                f for f in (rd / "outputs").iterdir() if f.is_file() and f.suffix in (".md", ".pdf", ".docx", ".txt", ".html", ".png")
                and f.name not in ("notes.md",)]
            if log == "sources" and (rd / "outputs" / "sources.md").exists():
                keep.append(rd / "outputs" / "sources.md")
            if meta.get("grader_sees_log") and (rd / "outputs" / "notes.md").exists():
                # Process matters for agentic skills: show the command log, with every
                # line that reveals the skill (its name, paths, SKILL.md) redacted.
                skill_name = Path(read_json(it / "config.json", {}).get("skill", "")).name or "\0"
                lines = (rd / "outputs" / "notes.md").read_text().splitlines()
                red = [("[redacted]" if (skill_name in ln or "SKILL.md" in ln or "/skills/" in ln) else ln) for ln in lines]
                (dst / "commands-log.md").write_text("\n".join(red) + "\n")
            for f in keep:
                if not f.exists():
                    print(f"  warning: {f} missing")
                    continue
                shutil.copy(f, dst / f.name)
                if f.suffix in (".pdf", ".docx"):
                    render(dst / f.name, dst, a.dpi)
                if f.suffix == ".docx":
                    docx_structure(dst / f.name, dst / f"{f.stem}-structure.txt")
            mapping[f"{ed.name}/{letter}"] = str(rd.relative_to(it))
        shutil.copy(ed / "eval_metadata.json", blind / ed.name / "eval_metadata.json")
        rubric = meta.get("rubric") or ["accuracy", "completeness", "clarity", "usefulness"]
        prompt = (template.replace("{EVAL_DIR}", str(blind / ed.name))
                          .replace("{LETTERS}", ", ".join(letters))
                          .replace("{RUBRIC}", ", ".join(rubric)))
        (it / "prompts").mkdir(exist_ok=True)
        (it / "prompts" / f"grade--{ed.name}.txt").write_text(prompt)
        print(f"{ed.name}: {len(runs)} runs → {', '.join(letters)}")

    write_json(it / "blind_mapping.json", mapping)
    print(f"\nmapping: {it / 'blind_mapping.json'} (do not show to graders)")
    print(f"grader prompts: {it / 'prompts'}/grade--*.txt — launch one grader per eval in one turn")


if __name__ == "__main__":
    main()
