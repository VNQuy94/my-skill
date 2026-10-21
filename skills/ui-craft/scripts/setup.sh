#!/usr/bin/env bash
# One-time setup for ui-craft. No sudo needed.
# Installs the scripts' own dependencies (playwright-core, yaml, icon SVG sources) under
# $UI_CRAFT_HOME and caches Google Fonts metadata. Projects keep their own dependencies.
# Usage: scripts/setup.sh [--check]
set -euo pipefail

SKILL="$(cd "$(dirname "$0")/.." && pwd)"
HOME_DIR="${UI_CRAFT_HOME:-${XDG_CACHE_HOME:-$HOME/.cache}/ui-craft}"
NODE_DIR="$HOME_DIR/node"
PKGS=(playwright-core yaml lucide-static @tabler/icons @phosphor-icons/core)

check() {
  local ok=0
  echo "ui-craft home: $HOME_DIR"
  if command -v node >/dev/null; then
    major=$(node -p 'process.versions.node.split(".")[0]')
    [[ $major -ge 20 ]] && echo "  ✓ node $(node -v)" || { echo "  ✗ node $(node -v) — need ≥ 20"; ok=1; }
  else echo "  ✗ node missing"; ok=1; fi
  for p in "${PKGS[@]}"; do
    [[ -f "$NODE_DIR/node_modules/$p/package.json" ]] && echo "  ✓ $p" || { echo "  ✗ $p — run scripts/setup.sh"; ok=1; }
  done
  [[ -f "$HOME_DIR/gf-meta.json" ]] && echo "  ✓ Google Fonts metadata cached" || echo "  · Google Fonts metadata not cached (needs network: python3 $SKILL/scripts/fonts_vi.py --refresh)"
  local chrome=""
  for c in "${UI_CRAFT_CHROME:-}" /usr/bin/chromium /usr/bin/chromium-browser /usr/bin/google-chrome-stable /usr/bin/google-chrome; do
    [[ -n "$c" && -x "$c" ]] && { chrome="$c"; break; }
  done
  if [[ -n "$chrome" ]]; then echo "  ✓ browser: $chrome"
  elif ls "$HOME"/.cache/ms-playwright/chromium-* >/dev/null 2>&1; then echo "  ✓ browser: playwright chromium"
  else echo "  ✗ no Chromium — install it (pacman -S chromium / apt install chromium) or run: npx playwright install chromium"; ok=1; fi
  return $ok
}

if [[ "${1:-}" == "--check" ]]; then check; exit $?; fi

command -v npm >/dev/null || { echo "npm not found — install Node.js ≥ 20" >&2; exit 1; }
mkdir -p "$NODE_DIR"
[[ -f "$NODE_DIR/package.json" ]] || echo '{"private":true}' > "$NODE_DIR/package.json"
npm install --silent --prefix "$NODE_DIR" "${PKGS[@]}" >/dev/null
python3 "$SKILL/scripts/fonts_vi.py" --refresh --limit 0 >/dev/null 2>&1 || echo "warning: could not download Google Fonts metadata (offline?)" >&2
echo
check || true
