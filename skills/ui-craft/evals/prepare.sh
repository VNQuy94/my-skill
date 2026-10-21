#!/usr/bin/env bash
# Eval harness, step 1: give every run the same starting project in outputs/app/.
#   evals/prepare.sh <iteration_dir>
# Evals whose metadata names a fixture get a copy of evals/fixtures/<fixture>/;
# the others get a plain Vite + React + TS + Tailwind v4 project with nothing from ui-craft in it.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SKILL="$(cd "$HERE/.." && pwd)"
IT="$(cd "$1" && pwd)"
CACHE="${UI_CRAFT_HOME:-${XDG_CACHE_HOME:-$HOME/.cache}/ui-craft}/eval-base"

build_base() { # name src-dir
  local dst="$CACHE/$1"
  [[ -d "$dst/node_modules" ]] && return
  rm -rf "$dst"; mkdir -p "$dst"; cp -r "$2/." "$dst/"
  (cd "$dst" && npm install --silent >/dev/null)
}

# plain starter: Vite defaults, no tokens, no icon system, no hints
if [[ ! -d "$CACHE/plain/node_modules" ]]; then
  tmp="$(mktemp -d)"
  cp -r "$SKILL/assets/starter/." "$tmp/"
  rm -f "$tmp/src/styles/fonts.ts" "$tmp/src/styles/index.css"; rmdir "$tmp/src/styles"
  printf '@import "tailwindcss";\n' > "$tmp/src/index.css"
  printf 'node_modules/\ndist/\n' > "$tmp/.gitignore"
  cat > "$tmp/src/main.tsx" <<'EOF'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
EOF
  build_base plain "$tmp"; rm -rf "$tmp"
fi
for fx in "$HERE"/fixtures/*/; do
  name="$(basename "$fx")"
  rm -rf "$fx/node_modules" "$fx/dist"
  build_base "$name" "$fx"
done

for ed in "$IT"/eval-*/; do
  fixture=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get('fixture',''))" "$ed/eval_metadata.json" 2>/dev/null || true)
  if [[ -z "$fixture" ]]; then
    fixture=$(python3 - "$HERE/evals.json" "$(basename "$ed")" <<'EOF'
import json, sys
data = json.load(open(sys.argv[1]))
for e in data["evals"]:
    if sys.argv[2] == f"eval-{e['id']}-{e['name']}":
        print(e.get("fixture", ""))
EOF
)
  fi
  base="$CACHE/${fixture:-plain}"
  for out in "$ed"/*/run-*/outputs; do
    rm -rf "$out/app"
    cp -r --reflink=auto "$base" "$out/app"
    echo "$(basename "$ed") $(basename "$(dirname "$(dirname "$out")")")/$(basename "$(dirname "$out")"): app from ${fixture:-plain}"
  done
done
