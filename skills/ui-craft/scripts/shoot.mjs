#!/usr/bin/env node
// Screenshot the built app and check what only a real browser can see.
// Usage: node shoot.mjs [dist | http://localhost:5173] [--routes /,/pricing] [--widths 1440,390]
//                       [--dark] [--out .ui-craft/shots] [--wait 800] [--design DESIGN.md]
// A directory is served with an SPA fallback to index.html. Build first (npm run build).
// Errors (exit 1): horizontal overflow, page/console errors, failed requests, a DESIGN.md font
// that did not load, Vietnamese text drawn by a fallback font, text contrast below WCAG AA.
// Warnings: text under 12px, tight line-height on Vietnamese text, targets under 24px,
// text still invisible after scrolling (stuck entrance animations).
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { loadDesign, fontFamily, launchBrowser, Report } from './_lib.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const VALUE_OPTS = ['--routes', '--widths', '--out', '--wait', '--design'];
const target = args.find((a, i) => !a.startsWith('--') && !VALUE_OPTS.includes(args[i - 1])) || 'dist';
const routes = opt('--routes', '/').split(',');
const widths = opt('--widths', '1440,390').split(',').map(Number);
const outDir = opt('--out', '.ui-craft/shots');
const wait = +opt('--wait', 800);
const schemes = args.includes('--dark') ? ['light', 'dark'] : ['light'];
const design = existsSync(opt('--design', 'DESIGN.md')) ? (await loadDesign(opt('--design', 'DESIGN.md'))).tokens : {};
const families = Object.values(design.fonts || {}).map(fontFamily).filter(Boolean);

// ---------- static server ----------
let base = target, server;
if (!/^https?:/.test(target)) {
  const dir = resolve(target);
  if (!existsSync(join(dir, 'index.html'))) { console.error(`${dir}/index.html not found — run the build first`); process.exit(2); }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.ico': 'image/x-icon' };
  server = createServer((req, res) => {
    let p = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(dir) || !existsSync(p) || statSync(p).isDirectory()) p = existsSync(join(p, 'index.html')) ? join(p, 'index.html') : join(dir, 'index.html');
    res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
    res.end(readFileSync(p));
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  base = `http://127.0.0.1:${server.address().port}`;
}

// ---------- in-page audit ----------
async function audit({ families }) {
  const out = { overflow: [], contrast: [], tiny: [], tight: [], targets: [], hidden: [], fontFallback: [], fontsMissing: [], hues: [], fontsLoaded: [] };
  const vw = document.documentElement.clientWidth;
  const sel = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) return `${s}#${el.id}`;
    const c = [...el.classList].slice(0, 3).join('.');
    return c ? `${s}.${c}` : s;
  };
  const cvs = document.createElement('canvas'); cvs.width = cvs.height = 1;
  const ctx = cvs.getContext('2d', { willReadFrequently: true });
  const rgba = (css) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
  const bgOf = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage !== 'none') return null; // gradient or image: cannot judge
      const c = rgba(cs.backgroundColor);
      if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
    }
    let bg = [255, 255, 255, 1];
    for (const l of layers.reverse()) bg = over(l, bg);
    return bg;
  };
  const VI = /[ăâđêôơưĂÂĐÊÔƠƯàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;

  // overflow
  if (document.documentElement.scrollWidth > vw + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed') out.overflow.push(`${sel(el)} (right edge ${Math.round(r.right)}px > ${vw}px)`);
      if (out.overflow.length >= 5) break;
    }
  }

  // text checks
  const seen = new Set();
  const viFamilies = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent.trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.visibility === 'hidden' || cs.display === 'none' || r.width === 0 || r.height === 0) continue;
    if (el.closest('[aria-hidden="true"], svg, script, style, noscript')) continue;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    const snippet = text.slice(0, 40);
    if (op < 0.05) { out.hidden.push(`${sel(el)} "${snippet}"`); continue; }
    const size = parseFloat(cs.fontSize);
    if (size < 12) out.tiny.push(`${sel(el)} ${size}px "${snippet}"`);
    const lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / size;
    if (VI.test(text)) {
      viFamilies.add(cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());
      if (lh < 1.1) out.tight.push(`${sel(el)} line-height ${lh.toFixed(2)} "${snippet}"`);
    }
    const fg = rgba(cs.color); fg[3] *= op;
    const bg = bgOf(el);
    if (!bg) continue;
    const f = over(fg, bg);
    const L1 = lum(f), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const min = large ? 3 : 4.5;
    const disabled = el.closest('[disabled], [aria-disabled="true"]');
    if (ratio < min && !disabled) out.contrast.push(`${sel(el)} ${ratio.toFixed(2)}:1 < ${min} "${snippet}"`);
  }

  // fonts
  const faces = [...document.fonts].filter((f) => f.status === 'loaded');
  const clean = (s) => s.replace(/["']/g, '').replace(/ Variable$/, '').trim().toLowerCase();
  out.fontsLoaded = [...new Set(faces.map((f) => f.family.replace(/["']/g, '').trim()))];
  for (const fam of families) {
    if (!faces.some((f) => clean(f.family) === fam.toLowerCase())) out.fontsMissing.push(fam);
  }
  // A face can claim every code point yet lack the glyphs (subset files without unicode-range),
  // so measure: if a Vietnamese glyph renders exactly like two different fallbacks, it is missing.
  const SAMPLE = 'ệẫờữặỳđ';
  const mctx = document.createElement('canvas').getContext('2d');
  const width = (font, ch) => { mctx.font = font; return mctx.measureText(ch).width; };
  for (const fam of viFamilies) {
    if (!faces.some((f) => clean(f.family) === clean(fam))) continue;
    const exact = faces.map((f) => f.family.replace(/["']/g, '').trim());
    if (!exact.some((f) => f.toLowerCase() === fam.toLowerCase())) {
      out.fontFallback.push(`"${fam}" is not the name of any loaded @font-face (loaded: ${[...new Set(exact)].join(', ')}) — use the token class font-<role>`);
      continue;
    }
    try { await document.fonts.load(`16px "${fam}"`, SAMPLE); } catch {}
    const missing = [...SAMPLE].filter((ch) =>
      width(`32px "${fam}", monospace`, ch) === width('32px monospace', ch) &&
      width(`32px "${fam}", serif`, ch) === width('32px serif', ch));
    if (missing.length) out.fontFallback.push(`"${fam}" lacks ${missing.join(' ')} — Vietnamese diacritics render in a fallback font; load the vietnamese subset`);
  }

  // palette in use: cluster chromatic colors (text, backgrounds, borders, svg strokes) by hue
  const toOk = ([r, g, b]) => {
    const [R, G, B] = [r, g, b].map(lin);
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return { C: Math.hypot(a, bb), H: (Math.atan2(bb, a) * 180 / Math.PI + 360) % 360 };
  };
  const area = new Map();
  for (const el of document.querySelectorAll('body, body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const add = (css, w) => { const c = rgba(css); if (c[3] < 0.15) return; const k = css; area.set(k, (area.get(k) || 0) + w); };
    add(cs.backgroundColor, r.width * r.height);
    if (hasText) add(cs.color, r.width * r.height * 0.3);
    if (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0) add(cs.borderTopColor, (r.width + r.height) * 2);
    if (el instanceof SVGElement && cs.stroke && cs.stroke !== 'none') add(cs.stroke, 200);
    if (el instanceof SVGElement && cs.fill && cs.fill !== 'none') add(cs.fill, 200);
  }
  const clusters = [];
  for (const [css, w] of area) {
    const c = rgba(css); const ok = toOk(c);
    if (ok.C < 0.05) continue;
    const near = clusters.find((k) => Math.min(Math.abs(k.H - ok.H), 360 - Math.abs(k.H - ok.H)) < 25);
    if (near) { near.w += w; near.colors.add(css); } else clusters.push({ H: ok.H, w, colors: new Set([css]) });
  }
  out.hues = clusters.sort((a, b) => b.w - a.w).map((k) => ({ hue: Math.round(k.H), colors: [...k.colors].slice(0, 4), weight: Math.round(k.w) }));

  // targets
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button]')) {
    const box = el.closest('label') && !el.matches('a, button') ? el.closest('label') : el; // a wrapping label is the hit area
    const r = box.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline';
    if (!inline && (r.width < 24 || r.height < 24)) out.targets.push(`${sel(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  }
  for (const k of Object.keys(out)) if (!['hues', 'fontsLoaded'].includes(k)) out[k] = [...new Set(out[k])];
  return out;
}

// ---------- run ----------
mkdirSync(outDir, { recursive: true });
const browser = await launchBrowser();
const r = new Report();
const summary = [];
for (const scheme of schemes) for (const width of widths) for (const route of routes) {
  const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 900 }, colorScheme: scheme, deviceScaleFactor: 1 });
  const errors = [], failed = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  page.on('response', (res) => { if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`); });
  const url = base + route;
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); } catch (e) { r.error(url, `cannot load: ${e.message.split('\n')[0]}`); await page.close(); continue; }
  await page.evaluate(() => document.fonts.ready);
  // scroll through so in-view animations run, then return to the top
  await page.evaluate(async () => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise((ok) => setTimeout(ok, 120)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(wait);
  const where = `${route} @${width}${scheme === 'dark' ? ' dark' : ''}`;
  const name = `${route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '_')}-${width}${scheme === 'dark' ? '-dark' : ''}.png`;
  await page.screenshot({ path: join(outDir, name), fullPage: true });
  const a = await page.evaluate(audit, { families });
  for (const x of a.overflow) r.error(where, `horizontal overflow: ${x}`);
  for (const x of errors) r.error(where, `page error: ${x}`);
  for (const x of failed) r.error(where, `request failed: ${x}`);
  for (const x of a.fontsMissing) r.error(where, `font "${x}" from DESIGN.md never loaded — import it (fontsource) or fix the family name`);
  for (const x of a.fontFallback) r.error(where, `font: ${x}`);
  for (const x of a.contrast.slice(0, 8)) r.error(where, `contrast ${x}`);
  if (a.contrast.length > 8) r.error(where, `…and ${a.contrast.length - 8} more contrast failures`);
  for (const x of a.tiny.slice(0, 5)) r.warn(where, `tiny text ${x}`);
  for (const x of a.tight.slice(0, 5)) r.warn(where, `tight ${x} — stacked diacritics may collide`);
  for (const x of a.targets.slice(0, 5)) r.warn(where, `small target ${x} (min 24×24)`);
  for (const x of a.hidden.slice(0, 5)) r.warn(where, `text still invisible after scrolling: ${x}`);
  if (a.hues.length > 3) r.warn(where, `${a.hues.length} distinct hues in use (${a.hues.map((h) => h.hue + '°').join(', ')}) — beyond an accent, one secondary hue and status colors the page loses cohesion`);
  else r.info(where, `hues in use: ${a.hues.map((h) => h.hue + '°').join(', ') || 'none (neutral only)'}`);
  summary.push({ route, width, scheme, screenshot: join(outDir, name), ...a, errors, failed });
  await page.close();
}
await browser.close();
server?.close();
writeFileSync(join(outDir, 'report.json'), JSON.stringify(summary, null, 1));
r.print(`shoot (${summary.length} page views → ${outDir})`);
console.log('Now LOOK at every screenshot: hierarchy, rhythm, alignment, and whether it could be any other product.');
process.exit(r.errors ? 1 : 0);
