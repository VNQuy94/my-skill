#!/usr/bin/env bash
# One-time setup for doc-style. No sudo needed.
# Creates a private Python venv (typst, python-docx, pdfplumber, matplotlib)
# and a private npm prefix with docx-js, under $DOC_STYLE_HOME.
# Usage: scripts/setup.sh [--check]
set -euo pipefail

HOME_DIR="${DOC_STYLE_HOME:-${XDG_CACHE_HOME:-$HOME/.cache}/doc-style}"
VENV="$HOME_DIR/venv"
NODE_DIR="$HOME_DIR/node"

check() {
  local ok=0
  echo "doc-style home: $HOME_DIR"
  if [[ -x "$VENV/bin/python" ]] && "$VENV/bin/python" -c "import typst, docx, pdfplumber" 2>/dev/null; then
    echo "  ✓ python venv (typst, python-docx, pdfplumber)"
  else
    echo "  ✗ python venv missing — run scripts/setup.sh"; ok=1
  fi
  if [[ -f "$NODE_DIR/node_modules/docx/package.json" ]]; then
    echo "  ✓ docx-js"
  else
    echo "  ✗ docx-js missing — run scripts/setup.sh (needs node + npm)"; ok=1
  fi
  for tool in pdffonts pdftoppm; do
    command -v "$tool" >/dev/null && echo "  ✓ $tool" || { echo "  ✗ $tool missing — install poppler (e.g. pacman -S poppler / apt install poppler-utils)"; ok=1; }
  done
  command -v soffice >/dev/null && echo "  ✓ soffice (DOCX preview available)" || echo "  · soffice not found — DOCX visual preview disabled (optional: install LibreOffice)"
  if command -v fc-list >/dev/null; then
    for f in "Inter" "Noto Serif" "Liberation Serif"; do
      fc-list ":family=$f:lang=vi" family | grep -q . && echo "  ✓ font: $f" || echo "  · font not installed: $f (profiles fall back to the next font in the list)"
    done
  fi
  return $ok
}

if [[ "${1:-}" == "--check" ]]; then check; exit $?; fi

mkdir -p "$HOME_DIR"
if [[ ! -x "$VENV/bin/python" ]]; then
  python3 -m venv "$VENV"
fi
"$VENV/bin/pip" install --quiet --upgrade pip
"$VENV/bin/pip" install --quiet "typst>=0.13" "python-docx>=1.1" "pdfplumber>=0.11" "matplotlib>=3.8"

if command -v npm >/dev/null; then
  mkdir -p "$NODE_DIR"
  npm install --silent --prefix "$NODE_DIR" "docx@^9" >/dev/null
else
  echo "warning: npm not found; DOCX output will be unavailable" >&2
fi

echo
check || true
