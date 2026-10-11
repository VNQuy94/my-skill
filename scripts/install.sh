#!/usr/bin/env bash
# Install every skill in this repo on the current machine.
#   1. Symlink skills into ~/.claude/skills (Claude Code) and, with --agents,
#      also into ~/.agents/skills (agents that read the shared folder).
#   2. Run each skill's own scripts/setup.sh, if it has one.
# Safe to re-run. Usage: scripts/install.sh [--agents] [--no-setup]
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
agents=0
setup=1
for arg in "$@"; do
  case "$arg" in
    --agents) agents=1 ;;
    --no-setup) setup=0 ;;
    -h|--help) sed -n '2,7p' "$0"; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 1 ;;
  esac
done

echo "== Linking skills into ~/.claude/skills"
"$root/scripts/link.sh"
if (( agents )); then
  echo "== Linking skills into ~/.agents/skills"
  CLAUDE_SKILLS_DIR="$HOME/.agents/skills" "$root/scripts/link.sh"
fi

if (( setup )); then
  for s in "$root"/skills/*/scripts/setup.sh; do
    [[ -e "$s" ]] || continue
    name="$(basename "$(dirname "$(dirname "$s")")")"
    [[ "$name" == _* ]] && continue
    echo "== Setting up $name"
    bash "$s"
  done
fi

echo
echo "Done. Restart Claude Code (or start a new session) so it picks up new skills."
