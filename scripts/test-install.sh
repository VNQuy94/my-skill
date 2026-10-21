#!/usr/bin/env bash
# Verify installation from another directory without touching the real HOME.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/home with spaces" "$tmp/elsewhere"
cd "$tmp/elsewhere"
for option in '' '--agents'; do
  HOME="$tmp/home with spaces" CLAUDE_SKILLS_DIR="$tmp/wrong-target" \
    bash "$root/scripts/install.sh" --no-setup ${option:+"$option"}
  for skill in "$root"/skills/*/; do
    name="$(basename "$skill")"
    [[ "$name" == _* || ! -f "$skill/SKILL.md" ]] && continue
    for target in .claude .agents; do
      link="$tmp/home with spaces/$target/skills/$name"
      [[ -L "$link" && "$(readlink "$link")" == "$root/skills/$name" ]] || {
        echo "FAIL: missing or incorrect link: $link" >&2
        exit 1
      }
    done
  done
  [[ ! -e "$tmp/wrong-target" ]]
done
echo 'PASS: both HOME destinations, unrelated cwd, spaces, repeat install, legacy --agents'
