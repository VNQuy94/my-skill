#!/usr/bin/env bash
# Tạo symlink từ ~/.claude/skills/<ten-skill> tới skills/<ten-skill> trong repo,
# để Claude Code nhận skill ở mọi project. Sửa trong repo là có hiệu lực ngay.
# Không đụng tới thư mục/tệp không phải symlink (ví dụ ~/.claude/skills/synced).
# Cách dùng: scripts/link.sh            # link tất cả skill
#            scripts/link.sh <ten-skill> # link một skill
#            scripts/link.sh --unlink    # gỡ các symlink trỏ vào repo này
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
target_dir="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
mkdir -p "$target_dir"

if [[ "${1:-}" == "--unlink" ]]; then
  for link in "$target_dir"/*; do
    [[ -L "$link" ]] || continue
    if [[ "$(readlink "$link")" == "$root/skills/"* ]]; then
      rm "$link"
      echo "Đã gỡ: $link"
    fi
  done
  exit 0
fi

if [[ -n "${1:-}" ]]; then
  names=("$1")
else
  names=()
  for dir in "$root"/skills/*/; do
    n="$(basename "$dir")"
    [[ "$n" == _* ]] || names+=("$n")
  done
fi

for name in "${names[@]}"; do
  src="$root/skills/$name"
  dest="$target_dir/$name"
  if [[ ! -f "$src/SKILL.md" ]]; then
    echo "Bỏ qua $name: không có SKILL.md" >&2
    continue
  fi
  if [[ -e "$dest" && ! -L "$dest" ]]; then
    echo "Bỏ qua $name: $dest đã tồn tại và không phải symlink" >&2
    continue
  fi
  ln -sfn "$src" "$dest"
  echo "Đã link: $dest -> $src"
done
