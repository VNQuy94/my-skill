#!/usr/bin/env python3
"""Start a document folder with the theme and a chosen profile copied in.

Usage:
  new_doc.py <out_dir> --format pdf|docx|both [--profile modern|formal|nd30|path.json]

Creates <out_dir>/profile.json plus theme.typ + doc.typ (pdf) and/or
docx-theme.js + doc.js (docx). Edit only the content in doc.typ / doc.js.
"""
import argparse
import json
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _env import ASSETS, load_profile  # noqa: E402

TYP_STARTER = """#import "theme.typ": *
#show: setup.with(json("profile.json"), title: "Tiêu đề tài liệu")

#doc-title([Tiêu đề tài liệu], subtitle: [Phụ đề], meta: [Phiên bản · Ngày])

#callout(title: "Tóm tắt")[Hai đến bốn ý chính người đọc cần nắm.]

= Mục 1

Nội dung.
"""

JS_STARTER = """const { createTheme } = require("./docx-theme.js");
const t = createTheme(require("./profile.json"));

const children = [
  t.title("Tiêu đề tài liệu", { subtitle: "Phụ đề", meta: "Phiên bản · Ngày" }),
  t.callout("note", "Hai đến bốn ý chính người đọc cần nắm.", { title: "Tóm tắt" }),
  t.h1("Mục 1"),
  t.p("Nội dung."),
];

t.save(t.build(children, { title: "Tiêu đề tài liệu" }), process.argv[2] || "out.docx");
"""


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("out_dir")
    ap.add_argument("--format", choices=["pdf", "docx", "both"], required=True)
    ap.add_argument("--profile", default="modern")
    ap.add_argument("--force", action="store_true", help="overwrite existing doc.typ/doc.js")
    a = ap.parse_args()

    out = Path(a.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    profile = load_profile(a.profile)
    (out / "profile.json").write_text(json.dumps(profile, ensure_ascii=False, indent=2))

    made = ["profile.json"]
    if a.format in ("pdf", "both"):
        shutil.copy(ASSETS / "theme.typ", out / "theme.typ")
        made.append("theme.typ")
        if a.force or not (out / "doc.typ").exists():
            (out / "doc.typ").write_text(TYP_STARTER)
            made.append("doc.typ")
    if a.format in ("docx", "both"):
        shutil.copy(ASSETS / "docx-theme.js", out / "docx-theme.js")
        made.append("docx-theme.js")
        if a.force or not (out / "doc.js").exists():
            (out / "doc.js").write_text(JS_STARTER)
            made.append("doc.js")
    print(f"profile: {profile['name']} → {out}/ ({', '.join(made)})")


if __name__ == "__main__":
    main()
