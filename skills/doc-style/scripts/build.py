#!/usr/bin/env python3
"""Build a document made with new_doc.py.

Usage:
  build.py <doc.typ|doc.js> [-o OUTPUT]

doc.typ → PDF via the Typst Python package (fonts embedded and subset).
doc.js  → DOCX via node + docx-js from the doc-style npm prefix.
"""
import argparse
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _env import NODE_MODULES, ensure_venv  # noqa: E402


def build_pdf(src: Path, out: Path) -> None:
    ensure_venv("typst")
    import typst

    try:
        typst.compile(str(src), output=str(out), root=str(src.parent))
    except Exception as e:  # typst raises TypstError with a readable message
        sys.exit(f"typst error:\n{e}")


def build_docx(src: Path, out: Path) -> None:
    if not (NODE_MODULES / "docx").exists():
        sys.exit("doc-style: docx-js not installed. Run scripts/setup.sh first.")
    env = dict(os.environ, NODE_PATH=str(NODE_MODULES))
    r = subprocess.run(["node", src.name, str(out.resolve())], cwd=src.parent, env=env)
    if r.returncode:
        sys.exit(r.returncode)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src")
    ap.add_argument("-o", "--output")
    a = ap.parse_args()
    src = Path(a.src).resolve()
    if src.suffix == ".typ":
        out = Path(a.output) if a.output else src.with_suffix(".pdf")
        build_pdf(src, out)
    elif src.suffix == ".js":
        out = Path(a.output) if a.output else src.with_suffix(".docx")
        build_docx(src, out)
    else:
        sys.exit("build.py: expected a .typ or .js file")
    print(f"built {out}")


if __name__ == "__main__":
    main()
