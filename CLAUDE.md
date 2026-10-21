# CLAUDE.md

Repo này chứa các skill Claude Code cá nhân của người dùng. Người dùng giao tiếp bằng tiếng Việt.

## Cấu trúc

- `skills/<ten-skill>/SKILL.md`: mỗi skill một thư mục, có frontmatter `name` (trùng tên thư mục, kebab-case) và `description`.
- `skills/_template/`: mẫu. Thư mục bắt đầu bằng `_` không được validate hay link.
- `scripts/`: công cụ quản lý repo (bash).

## Lệnh

- Tạo skill: `scripts/new-skill.sh <ten-skill>`
- Kiểm tra: `scripts/validate.sh` (chạy sau mỗi lần sửa skill)
- Cài vào `~/.claude/skills`: `scripts/link.sh [<ten-skill>]`

## Khi tạo hoặc sửa skill

- Luôn tạo bằng `scripts/new-skill.sh` thay vì tạo tay.
- `description` phải nêu cả chức năng lẫn tình huống kích hoạt.
- Nội dung dài đưa vào `references/`, `SKILL.md` chỉ trỏ tới.
- Không sửa `~/.claude/skills/synced/` (do claude.ai đồng bộ).

## Khi kiểm thử skill

- Dùng skill `skill-eval` (`skills/skill-eval/`): `check_leakage.py` → `init_run.py` → chạy các prompt trong `prompts/` cùng một lượt → `record_timing.py` → `blind.py` → chấm theo `prompts/grade--*.txt` → `unblind.py` → `report.py --record`. Danh sách bẫy đã gặp: `skills/skill-eval/references/pitfalls.md`.
- Ví dụ minh họa trong skill **không được trùng chủ đề** với câu hỏi trong `evals/`. Nếu trùng, agent sẽ chép ví dụ và điểm số không còn đo được phương pháp (đã xảy ra với skill `research` ở lần chạy đầu).
- Kết quả chạy để trong `workspaces/<ten-skill>/iteration-N/` (đã gitignore).
- Khi giao việc cho subagent chạy thử, chỉ yêu cầu ghi query và URL đã mở. Nếu yêu cầu ghi lại cả suy nghĩ (plan, reflection), bộ lọc API có thể chặn với lý do `reasoning_extraction`.
