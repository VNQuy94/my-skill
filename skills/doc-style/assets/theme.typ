// doc-style theme for Typst.
//
// Every visual value comes from the profile JSON. Do not hard-code fonts,
// sizes, or colors in the document; use the helpers below instead.
//
// Usage (scripts/new_doc.py copies this file and profile.json next to doc.typ):
//   #import "theme.typ": *
//   #show: setup.with(json("profile.json"))

#let _profile = state("doc-style-profile", none)

#let _color(p, role) = rgb(p.colors.at(role))

// Word-style line spacing multiple -> Typst leading. With ascender/descender
// edges a line box is ~1.2em tall, so extra gap = (multiple - 1) * 1.2em.
#let _leading(p) = (p.spacing.line - 1) * 1.2em

#let setup(p, title: none, body) = {
  let c(role) = _color(p, role)
  let s = p.sizes_pt
  let sp = p.spacing
  let lead = _leading(p)
  let m = p.page.margin_mm

  _profile.update(p)
  set document(title: title) if title != none

  // Page and page numbers
  let pn = p.page.page_numbers
  let number-mark = context {
    let n = counter(page).get().first()
    if n > 1 or p.page.number_first_page {
      align(center, text(size: s.small * 1pt, fill: c("text_muted"), str(n)))
    }
  }
  set page(
    paper: p.page.paper,
    margin: (top: m.top * 1mm, bottom: m.bottom * 1mm, left: m.left * 1mm, right: m.right * 1mm),
    header: if pn == "top-center" { number-mark } else { none },
    footer: if pn == "bottom-center" { number-mark } else { none },
  )

  // Body text and paragraphs
  set text(
    font: p.fonts.body,
    size: s.body * 1pt,
    fill: c("text"),
    lang: p.lang,
    top-edge: "ascender",
    bottom-edge: "descender",
  )
  set par(
    leading: lead,
    spacing: lead + sp.paragraph_after_pt * 1pt,
    justify: sp.justify,
    first-line-indent: (amount: sp.first_line_indent_mm * 1mm, all: true),
  )

  // Headings: one look per level, from the profile only
  set heading(numbering: if p.headings.numbered { "1.1." } else { none })
  show heading: set text(
    font: p.fonts.heading,
    fill: c("heading"),
    weight: if p.headings.bold { "bold" } else { "regular" },
  )
  show heading: set par(justify: false)
  show heading.where(level: 1): set text(size: s.h1 * 1pt)
  show heading.where(level: 2): set text(size: s.h2 * 1pt)
  show heading.where(level: 3): set text(size: s.h3 * 1pt)
  show heading.where(level: 1): set block(above: sp.heading_before_pt.h1 * 1pt, below: sp.heading_after_pt.h1 * 1pt)
  show heading.where(level: 2): set block(above: sp.heading_before_pt.h2 * 1pt, below: sp.heading_after_pt.h2 * 1pt)
  show heading.where(level: 3): set block(above: sp.heading_before_pt.h3 * 1pt, below: sp.heading_after_pt.h3 * 1pt)

  // Lists
  set list(indent: 0.4em, body-indent: 0.5em, marker: (text(fill: c("accent"))[•], text(fill: c("text_muted"))[–]))
  set enum(indent: 0.4em, body-indent: 0.5em)

  // Tables (booktabs: no vertical rules, rules under the header only)
  let hf = p.table.header_fill
  let hr = p.table.header_rule
  let rr = p.table.row_rule
  set table(
    inset: (x: p.table.cell_pad_pt * 1.5pt, y: p.table.cell_pad_pt * 1pt),
    fill: (x, y) => if y == 0 and hf != "none" { c(hf) },
    stroke: (x, y) => {
      if y == 0 { (top: 0.9pt + c(hr), bottom: 0.7pt + c(hr)) }
      else if rr != "none" { (bottom: 0.4pt + c(rr)) }
    },
  )
  show table: set text(size: s.table * 1pt)
  show table: set par(justify: false, first-line-indent: 0pt)
  show table.cell.where(y: 0): set text(weight: "bold")

  // Figures and captions: tables captioned above, images below
  set figure.caption(separator: [. ])
  show figure.caption: set text(size: s.small * 1pt, fill: c("text_muted"))
  show figure.caption: set par(first-line-indent: 0pt, justify: false)
  show figure.where(kind: table): set figure.caption(position: top)
  show figure.where(kind: table): set figure(supplement: p.labels.table)
  show figure.where(kind: image): set figure(supplement: p.labels.figure)
  show figure: set block(above: sp.block_gap_pt * 1pt, below: sp.block_gap_pt * 1pt)

  // Code and links
  show raw: set text(font: p.fonts.mono, size: s.code * 1pt)
  show raw.where(block: true): it => block(
    fill: c("surface"), stroke: 0.5pt + c("border"), inset: 8pt, width: 100%, it,
  )
  show link: set text(fill: c("link"))

  body
}

// ---------- Helpers (use these instead of ad-hoc formatting) ----------

// Title block for the first page.
#let doc-title(title, subtitle: none, meta: none) = context {
  let p = _profile.get()
  let c(role) = _color(p, role)
  block(below: p.spacing.block_gap_pt * 2pt, {
    set par(first-line-indent: 0pt, justify: false)
    text(font: p.fonts.heading, size: p.sizes_pt.title * 1pt, weight: "bold", fill: c("heading"), title)
    if subtitle != none { linebreak(); text(size: p.sizes_pt.h3 * 1pt, fill: c("text_muted"), subtitle) }
    if meta != none { linebreak(); v(2pt); text(size: p.sizes_pt.small * 1pt, fill: c("text_muted"), meta) }
  })
}

// Callout box. kind: "note" | "tip" | "success" | "warning" | "danger".
#let callout(kind: "note", title: auto, body) = context {
  let p = _profile.get()
  let c(role) = _color(p, role)
  let strong-role = if kind in ("note", "tip") { "accent" } else { kind }
  let soft-role = if kind in ("note", "tip") { "accent_soft" } else { kind + "_soft" }
  let bar = p.callout.bar_width_pt * 1pt
  let label = if title == auto { p.labels.at(kind) } else { title }
  block(
    width: 100%,
    fill: c(soft-role),
    stroke: if bar > 0pt { (left: bar + c(strong-role)) } else { 0.5pt + c("border") },
    inset: p.callout.pad_pt * 1pt,
    above: p.spacing.block_gap_pt * 1pt,
    below: p.spacing.block_gap_pt * 1pt,
    {
      set par(first-line-indent: 0pt, justify: false)
      if label != none { text(weight: "bold", fill: c(strong-role), label); parbreak() }
      body
    },
  )
}

// Key figure: one number that matters, with a short label.
#let stat(value, label) = context {
  let p = _profile.get()
  let c(role) = _color(p, role)
  box(inset: (right: 16pt), {
    set par(first-line-indent: 0pt)
    text(size: p.sizes_pt.h1 * 1.2pt, weight: "bold", fill: c("accent"), value)
    linebreak()
    text(size: p.sizes_pt.small * 1pt, fill: c("text_muted"), label)
  })
}

// Data table with caption. numeric: column indexes to right-align.
// Default width: first column takes the remaining space, so tables span the
// text width and every table in the document lines up the same way.
#let data-table(header: (), rows: (), numeric: (), columns: auto, caption: none) = context {
  let p = _profile.get()
  let n = header.len()
  let cols = if columns == auto { (1fr,) + (auto,) * (n - 1) } else { columns }
  let al = range(n).map(i => if i in numeric { right } else { left })
  let rule = _color(p, p.table.header_rule)
  figure(
    kind: table,
    caption: caption,
    table(
      columns: cols,
      align: al,
      table.header(..header),
      ..rows.flatten(),
      table.hline(stroke: 0.9pt + rule),
    ),
  )
}

// Image figure with caption. Pass image content from the document:
//   #fig(image("chart.png", width: 80%), caption: [Doanh thu theo quý])
#let fig(body, caption: none) = figure(kind: image, caption: caption, body)

// ---------- Vietnamese administrative documents (profile nd30) ----------
// Layout per Appendix I, Decree 30/2020/ND-CP. See references/nd30.md.

// Two-column header: issuing body (left) and national motto (right), then
// document type and subject centred below. Sizes come from the nd30 profile.
#let nd30-header(parent: none, org: [], number: [], place-date: [], kind: none, subject: none) = context {
  let z = _profile.get().sizes_pt
  set par(first-line-indent: 0pt, justify: false, leading: 0.35em, spacing: 0.35em)
  grid(
    columns: (1fr, auto),  // right column sized to the motto line so it never wraps
    column-gutter: 10pt,
    align(center, {
      if parent != none { text(size: z.org * 1pt, upper(parent)); linebreak() }
      let name = text(size: z.org * 1pt, weight: "bold", upper(org))
      name
      v(1pt)
      line(length: measure(name).width * 0.4, stroke: 0.5pt)
      v(4pt)
      text(size: z.body * 1pt - 1pt)[Số: #number]
    }),
    align(center, {
      text(size: z.org * 1pt, weight: "bold")[CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM]
      linebreak()
      box(stroke: (bottom: 0.5pt), inset: (bottom: 2pt), text(size: z.motto * 1pt, weight: "bold")[Độc lập - Tự do - Hạnh phúc])
      v(6pt)
      text(size: z.motto * 1pt, style: "italic", place-date)
    }),
  )
  if kind != none {
    v(14pt)
    align(center, {
      text(size: z.body * 1pt, weight: "bold", upper(kind))
      if subject != none {
        linebreak()
        let sj = text(size: z.body * 1pt, weight: "bold", subject)
        sj
        v(1pt)
        line(length: measure(sj).width * 0.4, stroke: 0.5pt)
      }
    })
    v(8pt)
  }
}

// Signature block (right) with recipients (left).
//   authority: e.g. [TM. ỦY BAN NHÂN DÂN] or none; title: [CHỦ TỊCH]; name: [Nguyễn Văn A]
//   recipients: plain strings, e.g. ("- Như trên;", "- Lưu: VT, TCCB.")
//   (strings, not [content]: a leading "- " in content would become a list)
#let nd30-signature(authority: none, title: [], name: [], recipients: ()) = context {
  let z = _profile.get().sizes_pt
  set par(first-line-indent: 0pt, justify: false, leading: 0.35em, spacing: 0.35em)
  v(10pt)
  grid(
    columns: (1fr, 1.2fr),
    {
      if recipients.len() > 0 {
        text(size: z.recipient_label * 1pt, weight: "bold", style: "italic")[Nơi nhận:]
        for r in recipients { linebreak(); text(size: z.recipient * 1pt, r) }
      }
    },
    align(center, {
      if authority != none { text(size: z.motto * 1pt, weight: "bold", upper(authority)); linebreak() }
      text(size: z.motto * 1pt, weight: "bold", upper(title))
      v(56pt)
      text(size: z.motto * 1pt, weight: "bold", name)
    }),
  )
}
