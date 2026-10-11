#!/usr/bin/env python3
"""Validate a profile: required keys and WCAG contrast of its color pairs.

Usage:
  check_profile.py [NAME|profile.json ...]     (default: all bundled profiles)

Text pairs must reach 4.5:1 (WCAG AA for normal text). Run this after
creating or editing a profile.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _env import PROFILES, hex_to_rgb, load_profile  # noqa: E402

REQUIRED = ["name", "lang", "labels", "page", "fonts", "sizes_pt", "spacing", "headings", "colors", "chart_palette", "table", "callout"]
ROLES = ["text", "text_muted", "heading", "accent", "accent_soft", "border", "surface", "link",
         "success", "success_soft", "warning", "warning_soft", "danger", "danger_soft"]


def luminance(rgb):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = sorted((luminance(hex_to_rgb(a)), luminance(hex_to_rgb(b))), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def check(p: dict) -> int:
    bad = 0
    missing = [k for k in REQUIRED if k not in p] + [f"colors.{r}" for r in ROLES if r not in p.get("colors", {})]
    for m in missing:
        print(f"  ✗ missing {m}"); bad += 1
    if missing:
        return bad
    c = p["colors"]
    hf = p["table"]["header_fill"]
    pairs = [("text", "#FFFFFF"), ("text_muted", "#FFFFFF"), ("heading", "#FFFFFF"), ("link", "#FFFFFF"),
             ("text", "accent_soft"), ("accent", "accent_soft")]
    pairs += [(k, f"{k}_soft") for k in ("success", "warning", "danger")]
    pairs += [("text", k) for k in ("success_soft", "warning_soft", "danger_soft", "surface")]
    if hf != "none":
        pairs.append(("text", hf))
    for fg, bg in pairs:
        fgc = c.get(fg, fg)
        bgc = c.get(bg, bg)
        r = contrast(fgc, bgc)
        ok = r >= 4.5
        bad += not ok
        print(f"  {'✓' if ok else '✗'} {fg:<11} on {bg:<13} {r:5.2f}:1")
    return bad


def main() -> None:
    names = sys.argv[1:] or [x.stem for x in sorted(PROFILES.glob("*.json"))]
    total = 0
    for n in names:
        p = load_profile(n)
        print(f"{p['name']}:")
        total += check(p)
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
