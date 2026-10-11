// doc-style theme for docx-js (npm "docx", v9).
//
// Every visual value comes from the profile JSON and is declared once as a
// named style. Helpers only apply those styles, so every table, callout and
// caption in a document looks the same. Do not pass color/font/size to
// TextRun or Paragraph directly; lint_docx.py flags that as an error.
//
// Usage (scripts/new_doc.py copies this file and profile.json next to doc.js):
//   const { createTheme } = require("./docx-theme.js");
//   const t = createTheme(require("./profile.json"));
//   const children = [ t.title("Tiêu đề"), t.h1("Mục 1"), t.p("Nội dung"), t.table({...}) ];
//   (build() flattens nested arrays, so helpers that return arrays need no spread)
//   t.save(t.build(children), "out.docx");

const fs = require("fs");
const path = require("path");
const d = require("docx");

const PT = 20; // twips per point
const MM = 56.6929; // twips per millimetre
const hex = (h) => h.replace("#", "").toUpperCase();
const NONE = { style: d.BorderStyle.NONE, size: 0, color: "FFFFFF" };
const rule = (pt, color) => ({ style: d.BorderStyle.SINGLE, size: Math.max(2, Math.round(pt * 8)), color: hex(color) });

function imageSize(buf) {
  // PNG: width/height in IHDR
  if (buf.readUInt32BE(0) === 0x89504e47) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), type: "png" };
  // JPEG: scan for a SOFn marker
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7), type: "jpg" };
      }
      i += 2 + len;
    }
  }
  throw new Error("figure(): only PNG and JPEG images are supported");
}

function createTheme(p) {
  const c = (role) => hex(p.colors[role]);
  const s = p.sizes_pt;
  const sp = p.spacing;
  const half = (pt) => Math.round(pt * 2); // docx sizes are half-points
  const line = Math.round(240 * sp.line);
  const bodyFont = p.fonts.body[0];
  const headFont = p.fonts.heading[0];
  const monoFont = p.fonts.mono[0];
  const m = p.page.margin_mm;
  const pageW = 11906, pageH = 16838; // A4
  const contentW = Math.round(pageW - (m.left + m.right) * MM);
  const counters = { table: 0, figure: 0 };

  const tableText = { font: bodyFont, size: half(s.table), color: c("text") };
  const noIndent = { firstLine: 0 };
  const kinds = ["note", "tip", "success", "warning", "danger"];
  const strongRole = (k) => (k === "note" || k === "tip" ? "accent" : k);
  const softRole = (k) => (k === "note" || k === "tip" ? "accent_soft" : `${k}_soft`);

  const heading = (lvl) => ({
    id: `Heading${lvl}`, name: `Heading ${lvl}`, basedOn: "Normal", next: "Normal", quickFormat: true,
    run: { font: headFont, size: half(s[`h${lvl}`]), bold: p.headings.bold, color: c("heading") },
    paragraph: {
      spacing: { before: sp.heading_before_pt[`h${lvl}`] * PT, after: sp.heading_after_pt[`h${lvl}`] * PT, line },
      indent: noIndent, alignment: d.AlignmentType.LEFT, keepNext: true, keepLines: true,
      outlineLevel: lvl - 1,
    },
  });

  const paragraphStyles = [
    {
      id: "Normal", name: "Normal", quickFormat: true,
      run: { font: bodyFont, size: half(s.body), color: c("text") },
      paragraph: {
        spacing: { line, before: 0, after: sp.paragraph_after_pt * PT },
        indent: { firstLine: Math.round(sp.first_line_indent_mm * MM) },
        alignment: sp.justify ? d.AlignmentType.JUSTIFIED : d.AlignmentType.LEFT,
      },
    },
    heading(1), heading(2), heading(3),
    { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", run: { font: headFont, size: half(s.title), bold: true, color: c("heading") }, paragraph: { indent: noIndent, alignment: d.AlignmentType.LEFT, spacing: { after: 4 * PT, line } } },
    { id: "Subtitle", name: "Subtitle", basedOn: "Normal", next: "Normal", run: { size: half(s.h3), color: c("text_muted") }, paragraph: { indent: noIndent, alignment: d.AlignmentType.LEFT, spacing: { after: 2 * PT, line } } },
    { id: "Meta", name: "Meta", basedOn: "Normal", next: "Normal", run: { size: half(s.small), color: c("text_muted") }, paragraph: { indent: noIndent, alignment: d.AlignmentType.LEFT, spacing: { after: sp.block_gap_pt * 2 * PT, line } } },
    { id: "Caption", name: "Caption", basedOn: "Normal", next: "Normal", run: { size: half(s.small), color: c("text_muted") }, paragraph: { indent: noIndent, alignment: d.AlignmentType.CENTER, spacing: { before: sp.block_gap_pt * PT, after: 4 * PT, line } } },
    { id: "FigureCaption", name: "Figure Caption", basedOn: "Caption", next: "Normal", paragraph: { spacing: { before: 4 * PT, after: sp.block_gap_pt * PT } } },
    { id: "Figure", name: "Figure", basedOn: "Normal", next: "FigureCaption", paragraph: { indent: noIndent, alignment: d.AlignmentType.CENTER, keepNext: true, spacing: { before: sp.block_gap_pt * PT, after: 0 } } },
    { id: "TableText", name: "Table Text", basedOn: "Normal", run: tableText, paragraph: { indent: noIndent, alignment: d.AlignmentType.LEFT, spacing: { before: 0, after: 0, line: 240 } } },
    { id: "TableNumber", name: "Table Number", basedOn: "TableText", paragraph: { alignment: d.AlignmentType.RIGHT } },
    { id: "TableHeader", name: "Table Header", basedOn: "TableText", run: { bold: true } },
    { id: "TableHeaderNumber", name: "Table Header Number", basedOn: "TableHeader", paragraph: { alignment: d.AlignmentType.RIGHT } },
    { id: "CalloutBody", name: "Callout Body", basedOn: "Normal", paragraph: { indent: noIndent, alignment: d.AlignmentType.LEFT, spacing: { after: 0, line } } },
    ...kinds.map((k) => ({ id: `CalloutTitle_${k}`, name: `Callout Title ${k}`, basedOn: "CalloutBody", run: { bold: true, color: c(strongRole(k)) }, paragraph: { spacing: { after: 2 * PT, line } } })),
    { id: "StatValue", name: "Stat Value", basedOn: "Normal", run: { size: half(s.h1 * 1.2), bold: true, color: c("accent") }, paragraph: { indent: noIndent, alignment: d.AlignmentType.LEFT, spacing: { after: 0, line: 240 } } },
    { id: "StatLabel", name: "Stat Label", basedOn: "Normal", run: { size: half(s.small), color: c("text_muted") }, paragraph: { indent: noIndent, alignment: d.AlignmentType.LEFT, spacing: { after: 0, line: 240 } } },
    { id: "ListItem", name: "List Item", basedOn: "Normal", paragraph: { indent: noIndent, alignment: d.AlignmentType.LEFT, spacing: { after: 2 * PT, line } } },
    { id: "Code", name: "Code", basedOn: "Normal", run: { font: monoFont, size: half(s.code) }, paragraph: { indent: { firstLine: 0, left: 8 * PT }, alignment: d.AlignmentType.LEFT, spacing: { after: 0, line: 240 } } },
    // Spacer after table-based blocks. Word merges adjacent tables and puts no
    // space after a table, so every table/callout/stats block ends with this.
    { id: "BlockGap", name: "Block Gap", basedOn: "Normal", run: { size: 2 }, paragraph: { indent: noIndent, spacing: { before: 0, after: sp.block_gap_pt * PT, line: 240, lineRule: d.LineRuleType.EXACT } } },
    { id: "PageNumber", name: "Page Number", basedOn: "Normal", run: { size: half(s.small), color: c("text_muted") }, paragraph: { indent: noIndent, alignment: d.AlignmentType.CENTER, spacing: { after: 0 } } },
  ];

  const characterStyles = [
    { id: "Hyperlink", name: "Hyperlink", run: { color: c("link"), underline: { type: d.UnderlineType.SINGLE, color: c("link") } } },
    { id: "InlineCode", name: "Inline Code", run: { font: monoFont, size: half(s.code) } },
  ];

  const bulletLevel = (lvl, text, color) => ({
    level: lvl, format: d.LevelFormat.BULLET, text, alignment: d.AlignmentType.LEFT,
    style: { run: { color: hex(color) }, paragraph: { indent: { left: 360 + lvl * 360, hanging: 240 } } },
  });
  const numbering = {
    config: [
      { reference: "bullets", levels: [bulletLevel(0, "•", p.colors.accent), bulletLevel(1, "–", p.colors.text_muted)] },
      {
        reference: "numbers",
        levels: [
          { level: 0, format: d.LevelFormat.DECIMAL, text: "%1.", alignment: d.AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } },
          { level: 1, format: d.LevelFormat.LOWER_LETTER, text: "%2)", alignment: d.AlignmentType.LEFT, style: { paragraph: { indent: { left: 800, hanging: 300 } } } },
        ],
      },
    ],
  };

  const gap = () => new d.Paragraph({ style: "BlockGap", children: [] });

  // ---------- inline runs ----------
  const toRuns = (x) => (Array.isArray(x) ? x : [x]).map((r) => (typeof r === "string" ? new d.TextRun(r) : r));
  const b = (text) => new d.TextRun({ text, bold: true });
  const i = (text) => new d.TextRun({ text, italics: true });
  const code = (text) => new d.TextRun({ text, style: "InlineCode" });
  const link = (text, url) => new d.ExternalHyperlink({ link: url, children: [new d.TextRun({ text, style: "Hyperlink" })] });

  // ---------- blocks ----------
  const para = (content, style) => new d.Paragraph({ style, children: toRuns(content) });
  const title = (text, { subtitle, meta } = {}) => [
    para(text, "Title"),
    ...(subtitle ? [para(subtitle, "Subtitle")] : []),
    ...(meta ? [para(meta, "Meta")] : []),
  ];
  const h = (lvl) => (text) => new d.Paragraph({ heading: d.HeadingLevel[`HEADING_${lvl}`], children: toRuns(text) });

  // An array item is a nested list if it holds only strings/arrays, and a
  // run list (e.g. [t.b("Lead: "), "text"]) if it holds any run object.
  const isRuns = (arr) => arr.some((x) => typeof x === "object" && !Array.isArray(x));
  const list = (items, reference, lvl = 0) =>
    items.flatMap((it) =>
      Array.isArray(it) && !isRuns(it)
        ? list(it, reference, lvl + 1)
        : [new d.Paragraph({ style: "ListItem", numbering: { reference, level: lvl }, children: toRuns(it) })],
    );

  const cellMargins = { top: p.table.cell_pad_pt * PT, bottom: p.table.cell_pad_pt * PT, left: p.table.cell_pad_pt * 1.5 * PT, right: p.table.cell_pad_pt * 1.5 * PT };

  function columnWidths(n, widths) {
    if (widths) {
      const total = widths.reduce((a, x) => a + x, 0);
      const cols = widths.map((x) => Math.floor((x / total) * contentW));
      cols[0] += contentW - cols.reduce((a, x) => a + x, 0);
      return cols;
    }
    if (n === 1) return [contentW];
    const first = Math.round(contentW * 0.4);
    const rest = Math.floor((contentW - first) / (n - 1));
    return [contentW - rest * (n - 1), ...Array(n - 1).fill(rest)];
  }

  // Data table. header: string[], rows: (string|run[])[][], numeric: column indexes.
  function table({ header, rows, numeric = [], caption, widths }) {
    const n = header.length;
    const cols = columnWidths(n, widths);
    const hf = p.table.header_fill;
    const headerRule = rule(0.7, p.colors[p.table.header_rule]);
    const outerRule = rule(0.9, p.colors[p.table.header_rule]);
    const rowRule = p.table.row_rule === "none" ? NONE : rule(0.4, p.colors[p.table.row_rule]);
    const cell = (content, col, isHead) =>
      new d.TableCell({
        width: { size: cols[col], type: d.WidthType.DXA },
        margins: cellMargins,
        ...(isHead && hf !== "none" ? { shading: { fill: c(hf), type: d.ShadingType.CLEAR, color: "auto" } } : {}),
        ...(isHead ? { borders: { bottom: headerRule } } : {}),
        children: [para(content, isHead ? (numeric.includes(col) ? "TableHeaderNumber" : "TableHeader") : numeric.includes(col) ? "TableNumber" : "TableText")],
      });
    const out = [];
    if (caption) {
      counters.table += 1;
      out.push(new d.Paragraph({ style: "Caption", keepNext: true, children: [new d.TextRun(`${p.labels.table} ${counters.table}. `), ...toRuns(caption)] }));
    }
    out.push(
      new d.Table({
        width: { size: contentW, type: d.WidthType.DXA },
        columnWidths: cols,
        borders: { top: outerRule, bottom: outerRule, left: NONE, right: NONE, insideVertical: NONE, insideHorizontal: rowRule },
        rows: [
          new d.TableRow({ tableHeader: true, cantSplit: true, children: header.map((x, k) => cell(x, k, true)) }),
          ...rows.map((r) => new d.TableRow({ cantSplit: true, children: r.map((x, k) => cell(x, k, false)) })),
        ],
      }),
    );
    out.push(gap());
    return out;
  }

  // Callout box. kind: note | tip | success | warning | danger. body: string | string[]
  function callout(kind, body, { title } = {}) {
    if (!kinds.includes(kind)) throw new Error(`callout(): unknown kind ${kind}`);
    const label = title === undefined ? p.labels[kind] : title;
    const bar = p.callout.bar_width_pt;
    const borders = bar > 0
      ? { left: rule(bar, p.colors[strongRole(kind)]), top: NONE, bottom: NONE, right: NONE }
      : { left: rule(0.5, p.colors.border), top: rule(0.5, p.colors.border), bottom: rule(0.5, p.colors.border), right: rule(0.5, p.colors.border) };
    const pad = p.callout.pad_pt * PT;
    const bodyParas = (Array.isArray(body) ? body : [body]).map((x) => para(x, "CalloutBody"));
    return [new d.Table({
      width: { size: contentW, type: d.WidthType.DXA },
      columnWidths: [contentW],
      borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
      rows: [new d.TableRow({ cantSplit: true, children: [new d.TableCell({
        width: { size: contentW, type: d.WidthType.DXA },
        shading: { fill: c(softRole(kind)), type: d.ShadingType.CLEAR, color: "auto" },
        borders,
        margins: { top: pad, bottom: pad, left: pad, right: pad },
        children: [...(label ? [para(label, `CalloutTitle_${kind}`)] : []), ...bodyParas],
      })] })],
    }), gap()];
  }

  // Key figures in a row: [[value, label], ...]
  function stats(items) {
    const w = Math.floor(contentW / items.length);
    const cols = items.map(() => w);
    return [new d.Table({
      width: { size: w * items.length, type: d.WidthType.DXA },
      columnWidths: cols,
      borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
      rows: [new d.TableRow({ children: items.map(([v, l]) => new d.TableCell({
        width: { size: w, type: d.WidthType.DXA },
        margins: { top: 4 * PT, bottom: 4 * PT, left: 0, right: 8 * PT },
        children: [para(v, "StatValue"), para(l, "StatLabel")],
      })) })],
    }), gap()];
  }

  // Image with caption below. widthPct: share of the text width (0-100).
  function figure(imagePath, { caption, widthPct = 80 } = {}) {
    const data = fs.readFileSync(imagePath);
    const { w, h, type } = imageSize(data);
    const maxPx = (contentW / 1440) * 96 * (widthPct / 100);
    const scale = Math.min(1, maxPx / w);
    const out = [new d.Paragraph({ style: "Figure", children: [new d.ImageRun({ type, data, transformation: { width: Math.round(w * scale), height: Math.round(h * scale) }, altText: { title: caption ? String(caption) : path.basename(imagePath), description: caption ? String(caption) : "", name: path.basename(imagePath) } })] })];
    if (caption) {
      counters.figure += 1;
      out.push(new d.Paragraph({ style: "FigureCaption", children: [new d.TextRun(`${p.labels.figure} ${counters.figure}. `), ...toRuns(caption)] }));
    }
    return out;
  }

  const codeBlock = (text) => text.split("\n").map((ln) => new d.Paragraph({ style: "Code", children: [new d.TextRun(ln)] }));

  function pageNumberPara() {
    return new d.Paragraph({ style: "PageNumber", children: [new d.TextRun({ children: [d.PageNumber.CURRENT] })] });
  }

  function build(children, { title: docTitle } = {}) {
    const pos = p.page.page_numbers;
    const mark = () => [pageNumberPara()];
    const headers = {}, footers = {};
    if (pos === "top-center") { headers.default = new d.Header({ children: mark() }); headers.first = new d.Header({ children: p.page.number_first_page ? mark() : [] }); }
    if (pos === "bottom-center") { footers.default = new d.Footer({ children: mark() }); footers.first = new d.Footer({ children: p.page.number_first_page ? mark() : [] }); }
    return new d.Document({
      title: docTitle,
      styles: {
        default: { document: { run: { font: bodyFont, size: half(s.body), color: c("text") } } },
        paragraphStyles,
        characterStyles,
      },
      numbering,
      sections: [{
        properties: {
          titlePage: true,
          page: {
            size: { width: pageW, height: pageH },
            margin: { top: Math.round(m.top * MM), bottom: Math.round(m.bottom * MM), left: Math.round(m.left * MM), right: Math.round(m.right * MM) },
          },
        },
        headers, footers,
        children: children.flat(Infinity),
      }],
    });
  }

  const save = (doc, out) => d.Packer.toBuffer(doc).then((buf) => fs.writeFileSync(out, buf));

  return {
    profile: p, d,
    b, i, code, link,
    p: (x) => para(x, "Normal"),
    title, h1: h(1), h2: h(2), h3: h(3),
    bullets: (items) => list(items, "bullets"),
    numbered: (items) => list(items, "numbers"),
    table, callout, stats, figure, codeBlock, build, save,
  };
}

module.exports = { createTheme };
