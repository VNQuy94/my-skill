#!/usr/bin/env bash
# Kiểm tra mọi skill trong skills/ (bỏ qua thư mục bắt đầu bằng "_"):
# có SKILL.md, có frontmatter, name khớp tên thư mục, description không rỗng.
# Cách dùng: scripts/validate.sh
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
errors=0
count=0

fail() { echo "  ✗ $1"; errors=$((errors + 1)); }

for dir in "$root"/skills/*/; do
  dir="${dir%/}"
  name="$(basename "$dir")"
  [[ "$name" == _* ]] && continue
  count=$((count + 1))
  echo "• $name"

  file="$dir/SKILL.md"
  if [[ ! -f "$file" ]]; then
    fail "thiếu SKILL.md"
    continue
  fi
  if [[ "$(head -n1 "$file")" != "---" ]]; then
    fail "SKILL.md phải bắt đầu bằng frontmatter '---'"
    continue
  fi

  frontmatter="$(awk 'NR==1{next} /^---$/{exit} {print}' "$file")"
  fm_name="$(sed -n 's/^name:[[:space:]]*//p' <<<"$frontmatter" | head -n1)"
  fm_desc="$(sed -n 's/^description:[[:space:]]*//p' <<<"$frontmatter" | head -n1)"

  [[ "$fm_name" == "$name" ]] || fail "name '$fm_name' không khớp tên thư mục '$name'"
  [[ -n "$fm_desc" ]] || fail "description rỗng"
  grep -q "__SKILL_NAME__" "$file" && fail "còn placeholder __SKILL_NAME__"
done

echo
if (( count == 0 )); then
  echo "Chưa có skill nào (ngoài _template)."
elif (( errors > 0 )); then
  echo "$errors lỗi trong $count skill."
  exit 1
else
  echo "OK: $count skill hợp lệ."
fi
