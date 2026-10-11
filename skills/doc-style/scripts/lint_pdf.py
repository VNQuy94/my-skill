#!/usr/bin/env python3
"""Check a PDF against a doc-style profile.

Usage:
  lint_pdf.py <file.pdf> [--profile NAME|profile.json]

Errors (exit 1): fonts not embedded, fonts outside the profile, text/fill/
stroke colors outside the profile palette, missing glyphs.
Warnings: off-scale font sizes, too much bold, text-only pages.
If --profile is omitted, profile.json next to the file is used.
"""
import argparse
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _env import ensure_venv, load_profile, nearest_role, palette  # noqa: E402

ensure_venv("pdfplumber")
import pdfplumber  # noqa: E402


def to_rgb(color) -> tuple[int, int, int] | None:
    if color is None:
        return None
    if isinstance(color, (int, float)):
        color = (color,)
    color = tuple(float(x) for x in color if isinstance(x, (int, float)))
    if len(color) == 1:
        g = round(color[0] * 255)
        return (g, g, g)
    if len(color) == 3:
        return tuple(round(x * 255) for x in color)  # type: ignore[return-value]
    if len(color) == 4:
        c, m, y, k = color
        return tuple(round(255 * (1 - v) * (1 - k)) for v in (c, m, y))  # type: ignore[return-value]
    return None


def norm_font(name: str) -> str:
    name = name.split("+", 1)[-1]
    return re.sub(r"[^a-z]", "", name.lower())


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file")
    ap.add_argument("--profile")
    a = ap.parse_args()
    path = Path(a.file)
    prof_arg = a.profile or (str(path.parent / "profile.json") if (path.parent / "profile.json").exists() else "modern")
    profile = load_profile(prof_arg)
    pal = palette(profile)
    allowed_fonts = [re.sub(r"[^a-z]", "", f.lower()) for g in profile["fonts"].values() for f in g]
    sizes = sorted({float(v) for v in profile["sizes_pt"].values()} | {profile["sizes_pt"]["h1"] * 1.2})

    errors: list[str] = []
    warns: list[str] = []

    # Fonts must be embedded
    try:
        out = subprocess.run(["pdffonts", str(path)], capture_output=True, text=True, check=True).stdout.splitlines()[2:]
        for ln in out:
            cols = ln.split()
            if len(cols) >= 5:
                emb = cols[-5]
                if emb != "yes":
                    errors.append(f"font {cols[0]} is not embedded")
    except FileNotFoundError:
        warns.append("pdffonts not found — cannot check font embedding (install poppler)")

    text_colors: Counter = Counter()
    bad: Counter = Counter()
    bad_fonts: Counter = Counter()
    off_sizes: Counter = Counter()
    bold = total = 0
    body = profile["sizes_pt"]["body"]
    with pdfplumber.open(str(path)) as pdf:
        for pno, page in enumerate(pdf.pages, 1):
            chars = page.chars
            body_lines = set()
            has_visual = bool(page.rects or page.lines or page.images or page.curves)
            has_heading = False
            for ch in chars:
                if not ch["text"].strip():
                    continue
                if ch["text"] == "�":
                    errors.append(f"p{pno}: missing glyph (�) — font lacks a character")
                rgb = to_rgb(ch.get("non_stroking_color"))
                if rgb is not None:
                    role = nearest_role(rgb, pal)
                    text_colors[role or rgb] += 1
                    if role is None:
                        bad[("text", rgb)] += 1
                fn = norm_font(ch["fontname"])
                if not any(fn.startswith(f) for f in allowed_fonts):
                    bad_fonts[ch["fontname"].split("+", 1)[-1]] += 1
                sz = round(ch["size"], 1)
                if not any(abs(sz - s) <= 0.3 for s in sizes):
                    off_sizes[sz] += 1
                if sz > body + 0.5:
                    has_heading = True
                elif abs(sz - body) <= 0.3:
                    body_lines.add(round(ch["top"]))
                    total += 1
                    if "bold" in ch["fontname"].lower():
                        bold += 1
            for kind, items, key in (("fill", page.rects, "non_stroking_color"), ("stroke", page.rects + page.lines, "stroking_color")):
                for it in items:
                    if kind == "fill" and not it.get("fill", True):
                        continue
                    if kind == "stroke" and it.get("object_type") == "rect" and not it.get("stroke", True):
                        continue
                    rgb = to_rgb(it.get(key))
                    if rgb is not None and nearest_role(rgb, pal) is None:
                        bad[(kind, rgb)] += 1
            if profile.get("lint", {}).get("wall_of_text", True) and len(body_lines) > 35 and not has_visual and not has_heading:
                warns.append(f"p{pno}: {len(body_lines)} lines of plain text with no heading, table, list marker or figure — wall of text?")

    for (kind, rgb), n in bad.items():
        errors.append(f"{kind} color #{''.join(f'{x:02X}' for x in rgb)} is not a profile role color ({n}×)")
    for f, n in bad_fonts.items():
        errors.append(f"font {f} is not in the profile ({n} chars)")
    for s, n in sorted(off_sizes.items()):
        if n > 3:
            warns.append(f"font size {s}pt is not on the profile scale ({n} chars)")
    if total and bold / total > 0.3:
        warns.append(f"bold is {bold / total:.0%} of body text (keep under 30%)")

    for e in errors:
        print(f"ERROR  {e}")
    for w in warns:
        print(f"WARN   {w}")
    used = ", ".join(f"{k}:{v}" for k, v in text_colors.most_common(6))
    print(f"\n{path.name}: {len(errors)} error(s), {len(warns)} warning(s) · profile {profile['name']} · text colors by role: {used}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
