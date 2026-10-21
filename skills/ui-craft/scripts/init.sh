#!/usr/bin/env bash
# Prepare a React + Tailwind v4 project for ui-craft.
#   init.sh <dir> --icons lucide|tabler|phosphor [--no-install]
# New directory (no package.json): copies the Vite starter.
# Existing project: adds only what is missing — DESIGN.md, src/icons/ (Icon wrapper, registry,
# custom icon helper), and the icon package. Never overwrites existing files.
set -euo pipefail

SKILL="$(cd "$(dirname "$0")/.." && pwd)"
dir="${1:-}"; shift || true
lib=""; install=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    --icons) lib="$2"; shift 2 ;;
    --no-install) install=0; shift ;;
    *) echo "unknown option $1" >&2; exit 1 ;;
  esac
done
if [[ -z "$dir" || ! "$lib" =~ ^(lucide|tabler|phosphor)$ ]]; then
  echo "usage: $0 <dir> --icons lucide|tabler|phosphor [--no-install]" >&2; exit 1
fi
case "$lib" in
  lucide) pkg="lucide-react" ;;
  tabler) pkg="@tabler/icons-react" ;;
  phosphor) pkg="@phosphor-icons/react" ;;
esac

mkdir -p "$dir"
new=0
if [[ ! -f "$dir/package.json" ]]; then
  cp -rn "$SKILL/assets/starter/." "$dir/"
  new=1
  echo "created Vite + React + Tailwind v4 starter in $dir"
else
  tw=$(node -e "const p=require('$dir/package.json');console.log((p.dependencies||{}).tailwindcss||(p.devDependencies||{}).tailwindcss||'')" 2>/dev/null || true)
  [[ -n "$tw" && ! "$tw" =~ (^|[^0-9])4 ]] && echo "warning: tailwindcss $tw — theme.css needs Tailwind v4 (@theme). Upgrade first: npx @tailwindcss/upgrade" >&2
fi

copy() { # src dest — never overwrite
  if [[ -e "$2" ]]; then echo "kept existing $2"; else mkdir -p "$(dirname "$2")"; cp "$1" "$2"; echo "added $2"; fi
}
copy "$SKILL/assets/icons/Icon.tsx" "$dir/src/icons/Icon.tsx"
copy "$SKILL/assets/icons/customIcon.tsx" "$dir/src/icons/customIcon.tsx"
copy "$SKILL/assets/icons/registry.$lib.tsx" "$dir/src/icons/registry.tsx"
mkdir -p "$dir/src/icons/custom"
if [[ ! -e "$dir/DESIGN.md" ]]; then
  sed "s/^  library: lucide .*/  library: $lib        # lucide | tabler | phosphor — exactly one/" "$SKILL/assets/DESIGN.template.md" > "$dir/DESIGN.md"
  if [[ "$lib" == "phosphor" ]]; then
    sed -i 's/^  stroke: 1.75 .*/  weight: regular      # thin | light | regular | bold | fill | duotone/; /^  # weight: regular/d' "$dir/DESIGN.md"
  fi
  echo "added $dir/DESIGN.md (fill in every __ placeholder)"
fi
if [[ -f "$dir/.gitignore" ]] && ! grep -qx '.ui-craft/' "$dir/.gitignore"; then echo '.ui-craft/' >> "$dir/.gitignore"; fi
grep -q 'theme.css' "$dir"/src/*.css "$dir"/src/styles/*.css 2>/dev/null \
  || echo "note: import the generated theme after Tailwind in your main CSS:  @import \"tailwindcss\"; @import \"./styles/theme.css\";"

if [[ $install == 1 ]]; then
  ( cd "$dir" && { [[ $new == 1 ]] && npm install --silent; npm install --silent "$pkg"; } )
  echo "installed $pkg"
fi
echo "next: fill DESIGN.md, then: node $SKILL/scripts/tokens.mjs  (run inside $dir)"
