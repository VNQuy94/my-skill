#!/usr/bin/env python3
"""Find Google Fonts that support Vietnamese, and check a chosen family.

Uses Google Fonts' public metadata (cached for 30 days in ~/.cache/ui-craft/gf-meta.json).
Stdlib only.

  fonts_vi.py --check "Fraunces" "Be Vietnam Pro"   # exit 1 if any lacks Vietnamese
  fonts_vi.py --category serif --variable             # candidates
  fonts_vi.py --category sans --shuffle --limit 20    # a random sample, to break habits
  fonts_vi.py --search grotesk
  fonts_vi.py --refresh                               # re-download metadata

Each row shows the popularity rank: a rank under ~150 means the face is
everywhere already, so it gives little identity on its own.
"""
import argparse
import json
import os
import random
import sys
import time
import urllib.request

HOME = os.environ.get("UI_CRAFT_HOME") or os.path.join(
    os.environ.get("XDG_CACHE_HOME") or os.path.expanduser("~/.cache"), "ui-craft")
CACHE = os.path.join(HOME, "gf-meta.json")
URL = "https://fonts.google.com/metadata/fonts"
COMMON_RANK = 150
CATS = {"serif": "Serif", "sans": "Sans Serif", "display": "Display",
        "mono": "Monospace", "handwriting": "Handwriting"}


def fetch():
    req = urllib.request.Request(URL, headers={"User-Agent": "ui-craft"})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read().decode("utf-8")
    data = json.loads(raw[raw.find("{"):])
    fams = {}
    for f in data["familyMetadataList"]:
        weights = sorted({int(k.rstrip("i")) for k in f.get("fonts", {}) if k.rstrip("i").isdigit()})
        fams[f["family"].lower()] = {
            "family": f["family"],
            "category": f.get("category"),
            "vi": "vietnamese" in f.get("subsets", []),
            "variable": bool(f.get("axes")),
            "axes": [a["tag"] for a in f.get("axes", [])],
            "weights": weights,
            "italic": any(k.endswith("i") for k in f.get("fonts", {})),
            "popularity": f.get("popularity"),
            "designers": f.get("designers", []),
        }
    os.makedirs(HOME, exist_ok=True)
    with open(CACHE, "w") as fh:
        json.dump({"fetched": time.strftime("%Y-%m-%d"), "families": fams}, fh)
    return fams


def load(refresh=False):
    if not refresh and os.path.exists(CACHE) and time.time() - os.path.getmtime(CACHE) < 30 * 86400:
        with open(CACHE) as fh:
            return json.load(fh)["families"]
    try:
        return fetch()
    except Exception as e:  # offline: fall back to a stale cache
        if os.path.exists(CACHE):
            print(f"warning: could not refresh ({e}); using cached metadata", file=sys.stderr)
            with open(CACHE) as fh:
                return json.load(fh)["families"]
        sys.exit(f"cannot download Google Fonts metadata: {e}")


def row(m):
    w = m["weights"]
    wr = f"{w[0]}–{w[-1]}" if len(w) > 1 else (str(w[0]) if w else "?")
    pop = m["popularity"]
    tag = " common" if pop and pop <= COMMON_RANK else ""
    var = "variable " + ",".join(m["axes"]) if m["variable"] else "static"
    slug = m["family"].lower().replace(" ", "-")
    pkg = f"@fontsource-variable/{slug}" if m["variable"] else f"@fontsource/{slug}"
    return f"{m['family']:<28} {m['category']:<12} rank {pop or '?':>5}{tag:<7}  {wr:<8} {'italic ' if m['italic'] else '       '}{var:<26} {pkg}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", nargs="+", metavar="FAMILY")
    ap.add_argument("--category", choices=CATS)
    ap.add_argument("--variable", action="store_true")
    ap.add_argument("--italic", action="store_true", help="must have italics")
    ap.add_argument("--min-weights", type=int, default=0, help="at least N weights")
    ap.add_argument("--search")
    ap.add_argument("--uncommon", action="store_true", help=f"hide the {COMMON_RANK} most popular families")
    ap.add_argument("--shuffle", action="store_true")
    ap.add_argument("--limit", type=int, default=40)
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    fams = load(a.refresh)

    if a.check:
        bad = 0
        for name in a.check:
            m = fams.get(name.lower())
            if not m:
                print(f"? {name}: not on Google Fonts — check glyphs locally: fc-list ':lang=vi' family | grep -i '{name}'")
                bad = 1
            elif not m["vi"]:
                print(f"✗ {name}: no Vietnamese subset")
                bad = 1
            else:
                print(f"✓ {row(m)}")
        sys.exit(bad)

    rows = [m for m in fams.values() if m["vi"]]
    if a.category:
        rows = [m for m in rows if m["category"] == CATS[a.category]]
    if a.variable:
        rows = [m for m in rows if m["variable"]]
    if a.italic:
        rows = [m for m in rows if m["italic"]]
    if a.min_weights:
        rows = [m for m in rows if len(m["weights"]) >= a.min_weights or m["variable"]]
    if a.search:
        rows = [m for m in rows if a.search.lower() in m["family"].lower()]
    if a.uncommon:
        rows = [m for m in rows if not m["popularity"] or m["popularity"] > COMMON_RANK]
    total = len(rows)
    if a.shuffle:
        random.shuffle(rows)
    else:
        rows.sort(key=lambda m: m["popularity"] or 10**6)
    print(f"{total} Vietnamese-capable families match; showing {min(total, a.limit)}")
    for m in rows[: a.limit]:
        print(row(m))


if __name__ == "__main__":
    main()
