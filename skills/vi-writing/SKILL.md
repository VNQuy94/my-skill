---
name: vi-writing
description: Write and edit Vietnamese text that reads natural, correct, and consistent — capitalisation per Decree 30/2020 Appendix II, one spelling convention per document (kỉ/kỷ, hoà/hòa), Vietnamese number and date formats, punctuation spacing, technical terms, and rewriting translationese or AI-sounding phrasing. Use it whenever you produce or revise Vietnamese content meant to be read as a document, report, guide, notice, email, slide, UI text, or translation from English, or when the user asks to proofread, "soát lỗi", "chỉnh văn phong", "viết lại cho tự nhiên", "chuẩn chính tả", or "dịch sang tiếng Việt". Pairs with doc-style (layout) for .docx/.pdf deliverables.
---

# vi-writing

Vietnamese produced by models usually fails in four ways:

1. **Translationese**: English structure in Vietnamese words ("thực hiện việc cập nhật", "được phê duyệt bởi", "Kết nối thất bại").
2. **Inconsistency**: *kỉ niệm* and *kỷ niệm*, *hòa* and *hoà*, `1.000` and `1 000` in the same text.
3. **Foreign conventions**: Title Case headings, decimal points, commas before *và*, US dates.
4. **Wrong register**: chatty phrasing in an official notice, stiff officialese in a user guide.

## Workflow

### 1. Decide register and conventions before writing

| Decide | Options |
|---|---|
| Document type and register | administrative, report, guide, UI text, chat (see `references/style.md` §4) |
| Spelling convention | **y / hòa** (default for business and administration) or **i / hoà** per Decision 1989 (school material). Existing text → keep its convention. |
| Thousands separator | `.` (default) or a space (school material). Decimal mark is always `,`. |
| Terms | which English terms stay English for this audience; one term per concept |

### 2. Write

Follow `references/style.md` (voice, translationese patterns, terms) and `references/orthography.md` (capitals, i/y, numbers, dates, abbreviations). The essentials:

- Translate meaning, not words; short everyday words; active voice when the doer is known.
- Sentence case for headings and UI labels: "Hướng dẫn cài đặt", never "Hướng Dẫn Cài Đặt".
- Capitalise per Decree 30 Appendix II: *tỉnh Nam Định*, *Quận 1*, *Bộ Tài chính*, *Luật Doanh nghiệp*, *thứ Hai*, *tháng Năm*, *Điều 5* but *khoản 2*.
- Numbers: `12,5%`, `1.500.000 đồng`, `250 GB`; no space before `%`; a space between a number and its unit.
- No space before `, . : ; ! ?`, one after; no comma before *và*/*hoặc*.
- Administrative dates: `ngày 05 tháng 3 năm 2026`.
- Spell out an abbreviation on first use: *Bảo hiểm xã hội (BHXH)*.
- Content fidelity: editing style must not change facts, numbers, names, or obligations.
- **Deliver only the deliverable.** No preamble ("Đây là bản đã chỉnh:") and no translator or layout notes inside the text the user will send or print. Put notes in your chat reply instead.
- Status changes read as status: a fixed bug is "Đã sửa lỗi ứng dụng tự thoát khi mở tệp CSV", not a past-tense description that could be read as the old behaviour. Keep parallel items in the same structure.

### 3. Check

```bash
python3 <skill>/scripts/lint_vi.py <file.md|.txt|.docx|.pdf> [--admin]
```

Errors (decomposed Unicode, mixed i/y or tone placement, mixed or comma thousands separators, decimal points, space before punctuation, comma before *và*/*hoặc*) must be fixed. Warnings (Title Case headings, translationese, *của* chains, day/month capitals with `--admin`) need a decision. `thứ hai` as an ordinal ("cái thứ hai") is correct and can be ignored.
Text inside quotation marks is skipped by default, because proofreading notes quote the original wording (`--keep-quoted` to include it). When a deliverable shows "before" text outside quotes (e.g. a before/after table), lint the corrected text on its own.
For chat answers there is no file; apply the same rules while writing.

### 4. Read it once as the reader

Read the result top to bottom as the intended reader. Does any sentence sound translated? Is any term explained twice or not at all? Is the register the same from start to end?

## Proofreading someone else's text

- Fix errors; do not rewrite the author's voice unless asked. Informal forms that are acceptable in the register (VD, đ, "nhé" in an internal email) are not errors; leave them.
- Keep their convention (i/y, tone placement) and make it consistent.
- Report what you changed in groups (e.g. "chuẩn hóa 12 chỗ kỷ/kỉ theo cách viết y; bỏ 4 dấu phẩy trước 'và'"), not line by line.

## Sources

Decree 30/2020/ND-CP, Appendix II (capitalisation) and Appendix I (dates, numbering), read in full. Decision 1989/QĐ-BGDĐT of 25/05/2018 (articles 8, 9, 11: tone marks, i/y, numbers), applicable to school textbooks. Microsoft Vietnamese Style Guide (voice, word choice, punctuation, numbers, symbols). Rules not taken from these are marked *(rec.)* in the reference files.
