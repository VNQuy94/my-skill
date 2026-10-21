---
name: doc-style
description: Consistent, readable layout for generated documents (PDF and Word/DOCX) — fonts, line spacing, headings, bullets, tables, callouts, figures, charts, and a color system where every color has one role. Use it whenever you create or restyle a report, proposal, plan, guide, handout, letter, or Vietnamese administrative document (văn bản hành chính, Nghị định 30) as a .pdf or .docx, or the user mentions formatting, layout, "trình bày", "định dạng", font chữ, giãn dòng, bảng biểu, màu sắc, or says a document looks messy, inconsistent, or like a wall of text. Works alongside the docx/pdf skills: they handle file mechanics, this skill decides how the document looks and verifies it.
---

# doc-style

Generated documents usually fail in three ways, and this skill exists to prevent all three:

1. **Inconsistency.** Colors and formats are chosen place by place ("this table blue, that table green, this sentence red"), so the document loses its unity.
2. **Uneven spacing.** Spacing is patched locally with blank lines or per-paragraph tweaks instead of being defined once.
3. **Walls of text.** Everything is written as paragraphs, even content that is really a comparison, a procedure, or one key number.

The fix is structural, not a reminder to "be consistent": **every visual value lives in one profile, the document only applies named styles and helpers, and scripts check the result.**

`<skill>` below means the directory containing this file.

## Workflow

### 0. Setup (once per machine)

```bash
<skill>/scripts/setup.sh --check     # see what is missing
<skill>/scripts/setup.sh             # install: private venv + docx-js under ~/.cache/doc-style, no sudo
```

The Python scripts re-run themselves inside that venv, so call them with plain `python3`.

### 1. Choose the format and profile

- Format: **PDF** unless the user asks for Word/.docx or needs to edit the file in Word. Both formats can come from the same profile.
- Profile (`<skill>/assets/profiles/`):

| Profile | Use for |
|---|---|
| `modern` (default) | reports, proposals, plans, guides, internal documents |
| `formal` | printed, academic, or legal-style documents (serif, numbered headings) |
| `nd30` | Vietnamese administrative documents per Decree 30/2020 — read `references/nd30.md` |

If the user has brand colors or fonts, copy the closest profile, change only its values, and run `python3 <skill>/scripts/check_profile.py my.json` (it checks WCAG 4.5:1 contrast for every text/background pair). Never mix profiles in one document.

### 2. Plan the layout before writing

Decide the form of every section from the shape of its content: comparison → table, procedure → numbered list, key number → stat, trend → chart, caveat → callout, argument → short paragraphs. Read `references/content-shape.md` and write a short layout plan for anything longer than about a page. This step is what prevents walls of text.

### 3. Create the document folder and write the content

```bash
python3 <skill>/scripts/new_doc.py <out_dir> --format pdf|docx|both --profile modern
```

This copies `profile.json`, the theme (`theme.typ` and/or `docx-theme.js`), and a starter `doc.typ`/`doc.js`. Write only content in the starter, **using the helpers** listed in `references/components.md`: `data-table`/`t.table`, `callout`, `stat`/`t.stats`, `fig`/`t.figure`, headings, lists.

Hard rules, because each one is a way consistency silently breaks:

- **No direct formatting.** Never pass a color, font, or size to a text run, and never set spacing on one paragraph. If something needs a different look, it needs a role or a style in the profile.
- **Color means role.** Use the role table in `references/components.md`. Body text is never colored for emphasis; use bold sparingly or a callout. Status colors (success/warning/danger) only for content with that meaning.
- **Every table through the table helper**, so all tables share one look (booktabs: no vertical rules, units in headers, numbers right-aligned, caption above).
- **No blank paragraphs for spacing.** Spacing comes from the profile. (DOCX blocks end with a `BlockGap` paragraph; that is the only allowed empty paragraph.)
- **Charts via `scripts/chart_theme.py`**, so fonts and colors come from `chart_palette`.
- Headings: at most 3 levels, never skipped, always a heading style rather than a bold paragraph.
- **Content fidelity.** Layout work must not change the content: do not add facts, categories, people, or deadlines the user did not give, and do not turn a limit into an entitlement ("tối đa 30 ngày" stays "tối đa"). If something is needed but unknown, mark it as a placeholder ("[thời hạn]") and mention it when delivering.
- **Say it once.** A rule or number appears in one place; the summary may point to it, but do not repeat it in a stat, a list item, and a callout.

### 4. Build

```bash
python3 <skill>/scripts/build.py <out_dir>/doc.typ    # → doc.pdf (Typst, fonts embedded)
python3 <skill>/scripts/build.py <out_dir>/doc.js     # → doc.docx (docx-js)
```

Typst errors point to the exact line; fix and rebuild.

### 5. Lint (must reach 0 errors)

```bash
python3 <skill>/scripts/lint_pdf.py  <out_dir>/doc.pdf
python3 <skill>/scripts/lint_docx.py <out_dir>/doc.docx
```

Errors: colors outside the profile roles, unknown or non-embedded fonts, direct formatting, blank spacing paragraphs, tables that look different from each other, missing glyphs. Fix the source, not the symptom: an off-palette color means some content bypassed a helper.
Warnings (wall of text, fake headings, skipped heading levels, >30% bold, off-scale sizes) need a decision: fix them, or keep them deliberately and be able to say why.

### 6. Look at the pages

```bash
<skill>/scripts/render.sh <out_dir>/doc.pdf      # PNG per page in <out_dir>/preview/
```

Open the PNGs and check: elements of the same kind look identical; a figure or table is not separated from its heading by a page break (shrink the figure, or move a paragraph); no page ends with a large empty gap; no page is an unbroken block of text (except `nd30`); tables fit the width and numbers line up; headings are not stranded at the bottom of a page; charts are sharp and use the palette; Vietnamese diacritics render correctly.
DOCX preview needs LibreOffice (`soffice`). Without it, rely on `lint_docx.py` and say that the DOCX was not visually checked.

### 7. Deliver

Give the file path, the profile used, and anything you could not verify (for example "DOCX not previewed: LibreOffice not installed").

## Files

| Path | What it is |
|---|---|
| `assets/profiles/*.json` | the single source of every font, size, spacing, and color value |
| `assets/theme.typ` | Typst theme: `setup`, `doc-title`, `callout`, `stat`, `data-table`, `fig`, `nd30-header`, `nd30-signature` |
| `assets/docx-theme.js` | docx-js theme: named styles plus `title`, `h1–h3`, `p`, `bullets`, `numbered`, `table`, `callout`, `stats`, `figure`, `codeBlock`, `link`, `build`, `save` |
| `references/content-shape.md` | which form fits which content; layout plan template |
| `references/components.md` | color roles and the rules behind each component |
| `references/nd30.md` | Decree 30/2020 layout rules and helper usage |
| `scripts/` | `setup.sh`, `new_doc.py`, `build.py`, `lint_pdf.py`, `lint_docx.py`, `render.sh`, `check_profile.py`, `chart_theme.py` |
