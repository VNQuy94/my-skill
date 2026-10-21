---
name: Sổ Tay Đọc
mode: operate
character: [ngăn nắp, giấy, điềm tĩnh]
bold-move: "Mỗi lượt mượn là một dòng phiếu thư viện: cột ngày bên trái như dấu đóng, chữ serif cho tên sách"
colors:
  canvas: "oklch(0.965 0.012 92)"
  surface: "oklch(0.988 0.006 92)"
  ink: "oklch(0.25 0.03 255)"
  ink-muted: "oklch(0.47 0.025 255)"
  line: "oklch(0.86 0.018 88)"
  accent: "oklch(0.45 0.075 230)"
  on-accent: "oklch(0.98 0.008 230)"
  danger: "oklch(0.5 0.15 28)"
  success: "oklch(0.47 0.08 150)"
fonts:
  display: { family: "Literata", fallback: "Georgia, serif", variable: true }
  body: { family: "Commissioner", fallback: "system-ui, sans-serif", variable: true }
type:
  h1: { font: display, size: 2rem, line: 1.2, weight: 600, tracking: -0.01em }
  h2: { font: display, size: 1.375rem, line: 1.3, weight: 600 }
  title: { font: display, size: 1.0625rem, line: 1.35, weight: 500 }
  body: { font: body, size: 1rem, line: 1.6, weight: 400 }
  small: { font: body, size: 0.875rem, line: 1.5, weight: 400 }
  label: { font: body, size: 0.8125rem, line: 1.3, weight: 600 }
radius: { sm: 2px, md: 4px }
spacing: 4px
motion:
  ease: "cubic-bezier(0.2, 0.8, 0.2, 1)"
  fast: 150ms
  base: 220ms
  moment: "none — operate mode, feedback only"
icons:
  library: tabler
  stroke: 1.5
  cap: square
  join: miter
  sizes: [16, 20, 24]
  custom-dir: src/icons/custom
---

# Sổ Tay Đọc design

## Direction

Bạn đọc của thư viện phường, mở app trên điện thoại hoặc máy tính ở quầy để xem sách đang mượn, hạn trả và gia hạn. Thế giới của chủ đề: phiếu mượn bằng giấy, dấu ngày đóng mực, gáy sách, kệ có nhãn số.

## Why these tokens

- **Color:** nền giấy ngà ấm, chữ mực xanh đen. Accent xanh mực chỉ dành cho hành động chính, liên kết và trạng thái đang chọn. `danger` (đỏ dấu mộc) chỉ cho quá hạn, `success` cho đã trả.
- **Type:** Literata (serif cho đọc sách) cho tên sách và tiêu đề; Commissioner cho giao diện. Ngày tháng dùng `tabular-nums`.
- **Shape and elevation:** góc gần vuông (2–4px) như phiếu giấy; phân tầng bằng đường kẻ `line`, không dùng đổ bóng.
- **Icons:** Tabler nét 1.5, đầu nét vuông, khớp với đường kẻ mảnh của phiếu.

## Do / Don't

- Do: danh sách dạng dòng phiếu, phân cách bằng đường kẻ; ngày ở cột trái.
- Don't: thẻ bo tròn có đổ bóng; mỗi trạng thái một màu nền rực.

## Decision log

- 2026-10-01: thử nền trắng tinh — quá lạnh, đổi sang giấy ngà.
- 2026-10-01: bỏ đổ bóng, phân tầng bằng đường kẻ.
