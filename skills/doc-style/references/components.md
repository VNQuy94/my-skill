# Components

Rules for each building block, and the helper that implements it. Using the helper is what keeps every instance identical; the rules explain what the helper does, so you can judge content that does not fit it.

| Block | Typst (PDF) | docx-js (DOCX) |
|---|---|---|
| title block | `#doc-title([..], subtitle: [..], meta: [..])` | `t.title("..", { subtitle, meta })` |
| headings | `= H1`, `== H2`, `=== H3` | `t.h1()`, `t.h2()`, `t.h3()` |
| paragraph | plain text, blank line between paragraphs | `t.p("..")` or `t.p([t.b(".."), ".."])` |
| bullets / numbered | `- item` / `+ item` (bold lead-in: `- *Lead:* text`) | `t.bullets([..])` / `t.numbered([..])`; an array of strings = level-2 list, an array with runs = one item, e.g. `[t.b("Lead: "), "text"]` |
| data table | `#data-table(header: (..), rows: (..), numeric: (..), caption: [..])` | `t.table({ header, rows, numeric, caption, widths })` |
| callout | `#callout(kind: "note", title: auto)[..]` | `t.callout("note", ".." , { title })` |
| key figures | `#stat[92%][Label]` (several in a row) | `t.stats([["92%", "Label"], ...])` |
| figure | `#fig(image("x.png", width: 80%), caption: [..])` | `t.figure("x.png", { caption, widthPct })` |
| code | fenced raw block | `t.codeBlock("..")`, inline `t.code("..")` |
| link | `#link("url")[text]` | `t.link("text", "url")` |

## Color roles

Colors are assigned to **roles**, never to individual places. The same role has the same color everywhere in the document.

| Role | Used for |
|---|---|
| `text` | all body text, table text, list text |
| `text_muted` | captions, metadata, stat labels, page numbers |
| `heading` | headings and the title |
| `accent` | table header rule, list markers, key figures, note/tip callout bar |
| `accent_soft` | table header fill, note/tip callout fill |
| `border` | table row rules, code block border, chart gridlines |
| `surface` | code block background |
| `link` | hyperlinks |
| `success` / `warning` / `danger` (+ `_soft`) | **only** callouts or status values that carry that meaning |

Never color body text to emphasize it: use bold or a callout. Never give one table a different color than another: if a table needs to stand out, give it a better caption. Status colors are not decoration; a "warning" callout must contain a warning.

## Tables

From booktabs (Simon Fear), UK Analysis Function, and GOV.UK guidance:

- **No vertical rules, no double rules.** Rules only above the header, below the header, and at the bottom. Light row rules are optional (profile `row_rule`).
- **Units in the column header**, e.g. `Chi phí (tỷ đ)`, not repeated in every cell.
- **Right-align numbers and their headers** (`numeric:`), same decimal places within a column, digit before the decimal mark (0,5 not ,5).
- **Caption above the table**, phrased as a heading that says what the table shows; the helper numbers it ("Bảng 1.").
- **Header row repeats** on every page; rows do not split across pages.
- **Use column width for spacing**, never blank rows or columns.
- **Never use a table for page layout.** (The callout and stats helpers are the only exceptions, and they exist so you do not invent your own.)
- Keep tables narrow enough to read: more than ~6 columns usually means the table should be split or transposed.

## Lists

- Bullets for parallel items, numbers for sequences. At most 2 levels.
- Items start the same way (all verbs or all nouns) and are short; if an item needs more than 2 lines, bold its first words.
- About 7 items maximum; longer lists should be grouped under sub-headings or turned into a table.

## Callouts

- Kinds: `note` and `tip` (accent), `success`, `warning`, `danger`. Choose by meaning.
- One callout should hold one message. Two callouts in a row usually means the section needs restructuring.
- The summary at the top of a report is a `note` callout titled "Tóm tắt" (or the profile's language).

## Figures and charts

- Make charts with `scripts/chart_theme.py` so fonts and colors come from the profile. One series uses the accent; more series use `chart_palette` in order. If you need more colors than the palette has, facet or group the data instead.
- Every figure has a caption below it that states what to see, not just what it is.
- Size figures to the text width or less (`width: 80%` / `widthPct`). Keep aspect ratio. Export charts at 200 dpi PNG.
- Diagrams: draw boxes and arrows with the same palette; no 3D, shadows, or gradients.

## Headings

- Max 3 levels (profile `headings.max_level`). Do not skip levels.
- A heading is a heading style, never a bold paragraph. Headings say what the section contains; avoid generic headings like "Thông tin".
- Numbered headings only when the profile says so (`formal`).
