#!/usr/bin/env bash
# Tạo skill mới từ skills/_template.
# Cách dùng: scripts/new-skill.sh <ten-skill>
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
name="${1:-}"

if [[ -z "$name" ]]; then
  echo "Cách dùng: $0 <ten-skill>" >&2
  exit 1
fi
if [[ ! "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Lỗi: tên skill chỉ gồm chữ thường, số và dấu gạch ngang (kebab-case)." >&2
  exit 1
fi

dest="$root/skills/$name"
if [[ -e "$dest" ]]; then
  echo "Lỗi: $dest đã tồn tại." >&2
  exit 1
fi

cp -r "$root/skills/_template" "$dest"
find "$dest" -name .gitkeep -delete
sed -i "s/__SKILL_NAME__/$name/g" "$dest/SKILL.md"

echo "Đã tạo skill: skills/$name"
echo "Tiếp theo: sửa skills/$name/SKILL.md, rồi chạy scripts/validate.sh"
