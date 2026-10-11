"""Matplotlib theme from a doc-style profile, so charts match the document.

Usage (inside a script run with the doc-style venv python):
  import sys; sys.path.insert(0, "<skill>/scripts")
  from chart_theme import apply, series_colors
  p = apply("profile.json")            # sets rcParams: fonts, text/axis colors, no top/right spines
  ax.bar(x, y, color=series_colors(p, 1)[0])
  fig.savefig("chart.png", dpi=200)    # PNG, white background

Colors come only from profile["chart_palette"]: the first entry is the accent,
the rest are its tints and neutrals. Do not pick other colors.
"""
import json
from pathlib import Path


def apply(profile_path: str | Path) -> dict:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    p = json.loads(Path(profile_path).read_text())
    c = p["colors"]
    plt.rcParams.update({
        "font.family": "sans-serif",
        "font.sans-serif": p["fonts"]["body"] + ["DejaVu Sans"],
        "font.size": 9,
        "text.color": c["text"],
        "axes.labelcolor": c["text"],
        "axes.edgecolor": c["border"],
        "axes.titlecolor": c["heading"],
        "axes.titleweight": "bold",
        "axes.spines.top": False,
        "axes.spines.right": False,
        "axes.grid": True,
        "axes.grid.axis": "y",
        "grid.color": c["border"],
        "grid.linewidth": 0.5,
        "axes.axisbelow": True,
        "xtick.color": c["text_muted"],
        "ytick.color": c["text_muted"],
        "axes.prop_cycle": plt.cycler(color=p["chart_palette"]),
        "figure.facecolor": "white",
        "axes.facecolor": "white",
        "savefig.facecolor": "white",
        "savefig.bbox": "tight",
        "legend.frameon": False,
    })
    return p


def series_colors(p: dict, n: int) -> list[str]:
    """First n chart colors. One series → the accent; more → accent, tints, neutrals."""
    pal = p["chart_palette"]
    if n > len(pal):
        raise ValueError(f"{n} series but the profile defines {len(pal)} chart colors — group or facet the data instead")
    return pal[:n]
