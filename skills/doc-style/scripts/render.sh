#!/usr/bin/env bash
# Render document pages to PNG so you can look at them before delivering.
# Usage: scripts/render.sh <file.pdf|file.docx> [out_dir] [dpi]
# DOCX needs LibreOffice (soffice) to convert to PDF first.
set -euo pipefail

src="${1:?usage: render.sh <file.pdf|file.docx> [out_dir] [dpi]}"
out="${2:-$(dirname "$src")/preview}"
dpi="${3:-80}"
mkdir -p "$out"

case "$src" in
  *.pdf) pdf="$src" ;;
  *.docx)
    if ! command -v soffice >/dev/null; then
      echo "render.sh: soffice (LibreOffice) not found — cannot preview DOCX. Rely on lint_docx.py, or install LibreOffice." >&2
      exit 2
    fi
    soffice --headless --convert-to pdf --outdir "$out" "$src" >/dev/null 2>&1
    pdf="$out/$(basename "${src%.docx}").pdf"
    ;;
  *) echo "render.sh: expected .pdf or .docx" >&2; exit 1 ;;
esac

base="$out/$(basename "${pdf%.pdf}")"
pdftoppm -png -r "$dpi" "$pdf" "$base"
ls -1 "$base"*.png
