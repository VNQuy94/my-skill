#!/usr/bin/env node
// Render a one-page specimen of DESIGN.md — type, color roles (light and dark), the icon set
// with its stroke signature next to the custom icons, and core components in every state —
// then screenshot it. Show this to the user to approve the direction BEFORE building screens.
// Usage: node specimen.mjs [DESIGN.md] [--out .ui-craft] [--width 1280]
// Output: <out>/specimen.html, <out>/specimen.png (and specimen-dark.png when dark tokens exist)
import { writeFileSync, mkdirSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadDesign, parseColor, contrast, fontStack, fontFamily, moduleDir, launchBrowser, GF_META } from './_lib.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const designFile = args.find((a, i) => !a.startsWith('--') && !['--out', '--width'].includes(args[i - 1])) || 'DESIGN.md';
const outDir = opt('--out', '.ui-craft');
const width = +opt('--width', 1280);
const { tokens: t } = await loadDesign(designFile);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---------- fonts (Google Fonts CSS for the preview; projects self-host via fontsource) ----------
let gf = {};
if (existsSync(GF_META)) { try { gf = JSON.parse(readFileSync(GF_META, 'utf8')).families; } catch {} }
const fontLinks = [];
for (const f of Object.values(t.fonts || {})) {
  const fam = fontFamily(f);
  const meta = gf[fam?.toLowerCase()];
  if (!meta) continue;
  const spec = meta.variable && meta.weights.length > 1 ? `wght@${meta.weights[0]}..${meta.weights.at(-1)}` : `wght@${meta.weights.join(';')}`;
  fontLinks.push(`family=${encodeURIComponent(meta.family).replace(/%20/g, '+')}:${spec}`);
}
const fontHref = fontLinks.length ? `https://fonts.googleapis.com/css2?${fontLinks.join('&')}&display=block` : null;

// ---------- icons ----------
const CONCEPTS = [
  ['search', 'search', 'search', 'magnifying-glass'], ['settings', 'settings', 'settings', 'gear'], ['user', 'user', 'user', 'user'],
  ['home', 'house', 'home', 'house'], ['bell', 'bell', 'bell', 'bell'], ['calendar', 'calendar', 'calendar', 'calendar'],
  ['chart', 'chart-column', 'chart-bar', 'chart-bar'], ['document', 'file-text', 'file-text', 'file-text'], ['delete', 'trash', 'trash', 'trash'],
  ['add', 'plus', 'plus', 'plus'], ['check', 'check', 'check', 'check'], ['close', 'x', 'x', 'x'],
  ['arrow-right', 'arrow-right', 'arrow-right', 'arrow-right'], ['chevron-down', 'chevron-down', 'chevron-down', 'caret-down'],
  ['filter', 'funnel', 'filter', 'funnel'], ['download', 'download', 'download', 'download'], ['mail', 'mail', 'mail', 'envelope'],
  ['lock', 'lock', 'lock', 'lock'], ['favorite', 'heart', 'heart', 'heart'], ['upload', 'upload', 'upload', 'upload'],
];
const lib = t.icons?.library || 'lucide';
const stroke = t.icons?.stroke ?? 2;
const cap = t.icons?.cap ?? 'round';
const join_ = t.icons?.join ?? 'round';
const weight = t.icons?.weight ?? 'regular';
const PH_STROKE = { thin: 0.75, light: 1.125, regular: 1.5, bold: 2.25, fill: 1.5, duotone: 1.5 };

function libSvg(names) {
  const name = names[{ lucide: 1, tabler: 2, phosphor: 3 }[lib]];
  let file;
  if (lib === 'lucide') file = join(moduleDir('lucide-static') || '', 'icons', `${name}.svg`);
  if (lib === 'tabler') file = join(moduleDir('@tabler/icons') || '', 'icons', 'outline', `${name}.svg`);
  if (lib === 'phosphor') file = join(moduleDir('@phosphor-icons/core') || '', 'assets', weight, weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`);
  if (!file || !existsSync(file)) return null;
  return readFileSync(file, 'utf8').replace(/<!--.*?-->/gs, '').replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, '').trim();
}

function sizeSvg(svg, px) {
  let s = svg.replace(/<svg[^>]*>/, (root) => root.replace(/\s(width|height|class)="[^"]*"/g, '').replace('<svg', `<svg width="${px}" height="${px}"`));
  if (lib !== 'phosphor' || svg.includes('data-custom')) {
    const sw = ((lib === 'phosphor' ? PH_STROKE[weight] : stroke) * 24) / px;
    s = s.replace(/<svg[^>]*>/, (root) => root.replace(/\sstroke-(width|linecap|linejoin)="[^"]*"/g, '')
      .replace('<svg', `<svg stroke-width="${sw.toFixed(3)}" stroke-linecap="${cap}" stroke-linejoin="${join_}"`));
  }
  return s;
}

// custom icons: customIcon('name', <>…</>) JSX → SVG
const customDir = t.icons?.['custom-dir'] || 'src/icons/custom';
const customs = [];
if (existsSync(customDir)) {
  for (const f of readdirSync(customDir)) {
    const src = readFileSync(join(customDir, f), 'utf8');
    if (f.endsWith('.svg')) customs.push([f.replace('.svg', ''), src.replace(/<svg[^>]*>/, '').replace('</svg>', '')]);
    for (const m of src.matchAll(/customIcon\(\s*['"]([\w-]+)['"]\s*,\s*\(?\s*<>([\s\S]*?)<\/>/g)) {
      const body = m[2].replace(/\{\/\*.*?\*\/\}/g, '').replace(/([a-z])([A-Z])(\w*)=/g, (_, a, b, c) => `${a}-${b.toLowerCase()}${c}=`).replace(/=\{([^}]*)\}/g, '="$1"');
      customs.push([m[1], body]);
    }
  }
}
const customSvg = (body) => `<svg data-custom xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">${body}</svg>`;

const iconRows = (t.icons?.sizes || [16, 20, 24]).map((px) => {
  const libCells = CONCEPTS.map((c) => { const s = libSvg(c); return s ? `<span class="ic" title="${c[0]}">${sizeSvg(s, px)}</span>` : ''; }).join('');
  const custCells = customs.map(([n, b]) => `<span class="ic custom" title="${esc(n)} (custom)">${sizeSvg(customSvg(b), px)}</span>`).join('');
  return `<div class="iconrow"><span class="meta">${px}px</span>${libCells}${custCells ? `<span class="sep"></span>${custCells}` : ''}</div>`;
}).join('');
const missingIcons = !libSvg(CONCEPTS[0]);

// ---------- color ----------
const palette = (colors) => Object.entries(colors).map(([n, v]) => {
  const c = parseColor(v);
  const onCanvas = c && parseColor(colors.canvas) ? contrast(c, parseColor(colors.canvas)).toFixed(2) : '–';
  const onSurface = c && parseColor(colors.surface) ? contrast(c, parseColor(colors.surface)).toFixed(2) : '–';
  return `<div class="sw"><div class="chip" style="background:${v}"></div><div><b>${esc(n)}</b><br><span class="meta">${esc(v)}<br>on canvas ${onCanvas} · on surface ${onSurface}</span></div></div>`;
}).join('');

// ---------- css vars ----------
const vars = (colors) => Object.entries(colors).map(([n, v]) => `--color-${n}:${v};`).join('');
const fontVars = Object.entries(t.fonts || {}).map(([n, f]) => `--font-${n}:${fontStack(f)};`).join('');
const radius = t.radius || {};
const r = (k) => radius[k] ?? Object.values(radius)[0] ?? '0';
const shadow = t.shadow ? Object.values(t.shadow)[0] : null;
const typeCss = Object.entries(t.type || {}).map(([n, s]) => `.type-${n}{font-family:var(--font-${s.font});font-size:${s.size};${s.line ? `line-height:${s.line};` : ''}${s.tracking ? `letter-spacing:${s.tracking};` : ''}${s.weight ? `font-weight:${s.weight};` : ''}}`).join('\n');
const SAMPLE = {
  display: 'Ngày mới ở phố cũ', h1: 'Tổng quan tuần này', h2: 'Lịch sử thay đổi', h3: 'Người phụ trách',
  body: 'Tiếng Việt có nhiều dấu chồng như ế, ổ, ẫ, ượ, ữ; dòng chữ phải đủ cao để dấu không chạm vào dòng trên. Số liệu: 1.250.000 đ, 98,5%.',
};
const typeRows = Object.entries(t.type || {}).map(([n, s]) => `<div class="typerow"><span class="meta">type-${n}<br>${esc(fontFamily(t.fonts?.[s.font]) || '')} ${esc(s.size)}/${esc(s.line ?? '')} ${esc(s.weight ?? '')}</span><div class="type-${n}">${esc(SAMPLE[n] || 'Ẩn ổ ếch, ượm quả, những chữ có dấu — 0123456789')}</div></div>`).join('');

const page = (mode) => `<!doctype html><html lang="vi" data-mode="${mode}"><head><meta charset="utf-8">
${fontHref ? `<link rel="stylesheet" href="${fontHref}">` : ''}
<style>
:root{${vars(t.colors || {})}${fontVars}}
:root[data-mode=dark]{${vars({ ...(t.colors || {}), ...(t.dark || {}) })}}
*{box-sizing:border-box;margin:0}
body{background:var(--color-canvas);color:var(--color-ink);font-family:var(--font-body);padding:48px;line-height:1.5}
section{margin-top:48px} h2.s{font:600 13px/1 var(--font-body);color:var(--color-ink-muted);margin-bottom:16px}
.meta{font:12px/1.4 ui-monospace,monospace;color:var(--color-ink-muted)}
.head{display:flex;gap:32px;align-items:baseline;flex-wrap:wrap}
${typeCss}
.typerow{display:grid;grid-template-columns:220px 1fr;gap:24px;padding:12px 0;border-top:1px solid var(--color-line);align-items:baseline}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.sw{display:flex;gap:12px;align-items:center}.chip{width:56px;height:56px;border-radius:${r('sm')};border:1px solid var(--color-line)}
.iconrow{display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:10px 0;border-top:1px solid var(--color-line)}
.iconrow .meta{width:48px}.ic{display:inline-flex;color:var(--color-ink)}.ic.custom{color:var(--color-accent)}.sep{width:1px;height:24px;background:var(--color-line);margin:0 8px}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.btn{font:inherit;font-weight:600;padding:10px 18px;border-radius:${r('md')};border:1px solid transparent;cursor:pointer}
.primary{background:var(--color-accent);color:var(--color-on-accent)}
.secondary{background:var(--color-surface);color:var(--color-ink);border-color:var(--color-line)}
.ghost{background:transparent;color:var(--color-accent)}
.btn[disabled]{opacity:.45;cursor:not-allowed}.focus{outline:2px solid var(--color-accent);outline-offset:2px}
.field{display:grid;gap:6px;width:280px}.field input{font:inherit;padding:10px 12px;border-radius:${r('sm')};border:1px solid var(--color-line);background:var(--color-surface);color:var(--color-ink)}
.field.err input{border-color:var(--color-danger,var(--color-ink))}.field.err .meta{color:var(--color-danger,var(--color-ink))}
.panel{background:var(--color-surface);border-radius:${r('lg')};padding:24px;${shadow ? `box-shadow:${shadow};` : 'border:1px solid var(--color-line);'}max-width:520px}
table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}td,th{text-align:left;padding:8px 0;border-bottom:1px solid var(--color-line)}td.n,th.n{text-align:right}
</style></head><body>
<div class="head"><div class="type-${t.type?.display ? 'display' : Object.keys(t.type || {})[0]}">${esc(t.name || 'Design')}</div>
<div class="meta">${esc(t.mode || '')} · ${(t.character || []).map(esc).join(' · ')}<br>bold move: ${esc(t['bold-move'] || '–')}</div></div>
<section><h2 class="s">Type</h2>${typeRows}</section>
<section><h2 class="s">Color roles (${mode})</h2><div class="grid">${palette(mode === 'dark' ? { ...(t.colors || {}), ...(t.dark || {}) } : (t.colors || {}))}</div></section>
<section><h2 class="s">Icons — ${esc(lib)} ${lib === 'phosphor' ? esc(weight) : `stroke ${stroke}, ${esc(cap)} caps, ${esc(join_)} joins`}${customs.length ? ' · custom icons in accent after the divider' : ''}</h2>${missingIcons ? '<p class="meta">icon sources missing — run setup.sh</p>' : iconRows}</section>
<section><h2 class="s">Components</h2>
<div class="row"><button class="btn primary">Lưu thay đổi</button><button class="btn primary focus">Đang focus</button><button class="btn secondary">Huỷ</button><button class="btn ghost">Xem chi tiết</button><button class="btn primary" disabled>Không khả dụng</button></div>
<div class="row" style="margin-top:20px"><label class="field"><span class="type-label">Email</span><input value="ten@congty.vn"></label>
<label class="field err"><span class="type-label">Số điện thoại</span><input value="09123"><span class="meta">Số điện thoại cần đủ 10 chữ số.</span></label></div>
<div class="panel" style="margin-top:20px"><div class="type-h3">Đơn hàng gần đây</div>
<table><tr><th>Mã</th><th>Khách hàng</th><th class="n">Giá trị</th></tr><tr><td>DH-1042</td><td>Nguyễn Thị Hằng</td><td class="n">1.250.000 đ</td></tr><tr><td>DH-1043</td><td>Trần Quốc Việt</td><td class="n">89.000 đ</td></tr></table></div>
</section></body></html>`;

mkdirSync(outDir, { recursive: true });
const modes = t.dark ? ['light', 'dark'] : ['light'];
const browser = await launchBrowser();
for (const mode of modes) {
  const html = join(outDir, mode === 'light' ? 'specimen.html' : 'specimen-dark.html');
  writeFileSync(html, page(mode));
  const p = await browser.newPage({ viewport: { width, height: 900 } });
  await p.goto(pathToFileURL(resolve(html)).href, { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  const missing = await p.evaluate((fams) => fams.filter((f) => !document.fonts.check(`16px "${f}"`, 'ệ')), Object.values(t.fonts || {}).map(fontFamily));
  if (missing.length) console.log(`! fonts not loaded in preview (offline or not on Google Fonts): ${missing.join(', ')}`);
  const png = html.replace(/\.html$/, '.png');
  await p.screenshot({ path: png, fullPage: true });
  console.log(`wrote ${png}`);
}
await browser.close();
if (missingIcons) console.log('! icon sources not found — run <ui-craft>/scripts/setup.sh');
console.log(`custom icons shown: ${customs.length}`);
