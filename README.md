# My-Skill

Kho chứa các skill cá nhân cho Claude Code, phục vụ công việc hằng ngày.

## Cấu trúc

```
My-Skill/
├── skills/
│   ├── _template/          # mẫu cho skill mới (không được link)
│   │   ├── SKILL.md
│   │   ├── references/     # tài liệu dài, Claude chỉ đọc khi cần
│   │   └── scripts/        # script hỗ trợ skill
│   └── <ten-skill>/        # mỗi skill là một thư mục
│       └── SKILL.md
├── scripts/
│   ├── new-skill.sh        # tạo skill mới từ mẫu
│   ├── validate.sh         # kiểm tra frontmatter của mọi skill
│   └── link.sh             # cài skill vào ~/.claude/skills bằng symlink
├── CLAUDE.md               # hướng dẫn cho Claude khi làm việc trong repo
└── README.md
```

## Danh sách skill

| Skill | Mô tả |
|---|---|
| [`research`](skills/research/SKILL.md) | Phương pháp research: chọn độ sâu, viết query đúng từ khóa, đánh giá nguồn, trích dẫn, khi nào dừng. Thay thế `research-methodology` và `web-research` cũ trong `~/.agents/skills`. |

## Quy trình

```fish
scripts/new-skill.sh ten-skill   # 1. tạo skill
$EDITOR skills/ten-skill/SKILL.md # 2. viết nội dung
scripts/validate.sh              # 3. kiểm tra
scripts/link.sh ten-skill        # 4. cài vào ~/.claude/skills
```

Mặc định `link.sh` cài vào `~/.claude/skills` (Claude Code). Để cài cho các agent đọc `~/.agents/skills`, chạy `CLAUDE_SKILLS_DIR=~/.agents/skills scripts/link.sh <ten-skill>`.

Sau khi link, skill dùng được trong mọi project. Vì là symlink nên sửa file trong repo là có hiệu lực ngay, không cần link lại. Gỡ toàn bộ link bằng `scripts/link.sh --unlink`.

## Quy ước viết skill

- Tên thư mục dạng kebab-case và **trùng** với trường `name` trong frontmatter.
- `description` nói rõ skill làm gì **và khi nào** dùng. Claude dựa vào trường này để quyết định nạp skill.
- Bộ kiểm thử của skill đặt trong `skills/<ten>/evals/` (định dạng của skill-creator). Kết quả chạy thử nằm trong `workspaces/` (không đưa vào git).
- Giữ `SKILL.md` ngắn gọn. Tài liệu dài đặt trong `references/`, code lặp lại đặt trong `scripts/`.
