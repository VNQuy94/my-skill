#!/usr/bin/env node
// Consistency checks for the icon system.
// Usage: node lint_icons.mjs [--design DESIGN.md] [--icons src/icons]
//  - icon-config.ts matches DESIGN.md (regenerate with tokens.mjs if stale)
//  - registry: one library, one picture per concept, no picture used for two concepts
//  - custom icons (customIcon() .tsx files or .svg files in icons.custom-dir):
//    24×24 grid, geometry inside the 1–23 live area, stroke only, currentColor,
//    no transforms/fills/text/images, no hard-coded stroke width, ≥ 2px between parallel strokes is
//    left to the visual specimen (specimen.mjs).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { loadDesign, Report } from './_lib.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const { tokens: t } = await loadDesign(opt('--design', 'DESIGN.md'));
const iconsDir = opt('--icons', 'src/icons');
const customDir = t.icons?.['custom-dir'] || join(iconsDir, 'custom');
const r = new Report();
const rel = (p) => relative(process.cwd(), p);

// ---------- config freshness ----------
const cfgFile = join(iconsDir, 'icon-config.ts');
if (!existsSync(cfgFile)) r.error(rel(cfgFile), 'missing — run tokens.mjs');
else {
  const cfg = readFileSync(cfgFile, 'utf8');
  const want = { library: t.icons?.library, stroke: t.icons?.stroke ?? 2, cap: t.icons?.cap ?? 'round', join: t.icons?.join ?? 'round' };
  for (const [k, v] of Object.entries(want)) {
    const m = cfg.match(new RegExp(`"${k}":\\s*"?([^",\\n]+)"?`));
    if (!m || String(m[1]) !== String(v)) r.error(rel(cfgFile), `${k} is ${m?.[1]} but DESIGN.md says ${v} — rerun tokens.mjs`);
  }
}

// ---------- registry ----------
const regFile = ['registry.tsx', 'registry.ts'].map((f) => join(iconsDir, f)).find(existsSync);
if (!regFile) r.error(iconsDir, 'no registry.tsx — copy it from <ui-craft>/assets/icons/');
else {
  const src = readFileSync(regFile, 'utf8');
  const pkgs = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]).filter((p) => !p.startsWith('.'));
  const libs = new Set(pkgs);
  if (libs.size > 1) r.error(rel(regFile), `imports from ${[...libs].join(' + ')} — one icon library only`);
  const body = src.slice(src.indexOf('icons'));
  const entries = [...body.matchAll(/^\s*['"]?([\w-]+)['"]?\s*:\s*([\w.]+)\s*,?\s*$/gm)].map((m) => [m[1], m[2]]);
  const byComp = new Map();
  for (const [concept, comp] of entries) byComp.set(comp, [...(byComp.get(comp) || []), concept]);
  for (const [comp, concepts] of byComp) if (concepts.length > 1) r.warn(rel(regFile), `${comp} is used for ${concepts.join(' and ')} — one picture should mean one thing`);
  r.info(rel(regFile), `${entries.length} concepts registered`);
}

// ---------- custom icons ----------
function pathPoints(d) {
  const toks = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) || [];
  const pts = [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0;
  const num = () => parseFloat(toks[i++]);
  const counts = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    const lc = cmd.toLowerCase(), rel = cmd === lc;
    if (lc === 'z') { x = sx; y = sy; continue; }
    const n = counts[lc];
    if (n === undefined || i + n > toks.length) break;
    const v = Array.from({ length: n }, num);
    const ox = rel ? x : 0, oy = rel ? y : 0;
    if (lc === 'h') { x = ox + v[0]; pts.push([x, y]); }
    else if (lc === 'v') { y = oy + v[0]; pts.push([x, y]); }
    else if (lc === 'a') { x = ox + v[5]; y = oy + v[6]; pts.push([x, y]); }
    else {
      for (let k = 0; k < n; k += 2) pts.push([ox + v[k], oy + v[k + 1]]);
      x = ox + v[n - 2]; y = oy + v[n - 1];
    }
    if (lc === 'm') { sx = x; sy = y; cmd = rel ? 'l' : 'L'; }
  }
  return pts;
}

function attrs(tag) {
  const a = {};
  for (const m of tag.matchAll(/([\w-:]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g)) a[m[1]] = m[2] ?? m[3] ?? m[4];
  return a;
}

function checkGeometry(file, markup) {
  const where = rel(file);
  const tags = [...markup.matchAll(/<(\w+)([^>]*)\/?>/g)].filter((m) => m[1] !== 'svg' && m[1] !== '>' );
  const allowed = new Set(['path', 'circle', 'line', 'polyline', 'polygon', 'rect', 'ellipse', 'g']);
  const pts = [];
  for (const [, name, rest] of tags) {
    if (/^[A-Z]/.test(name) || name === 'Fragment') continue;
    if (!allowed.has(name)) { r.error(where, `<${name}> not allowed in an icon (no text, images, masks or filters)`); continue; }
    const a = attrs(rest);
    if (a.transform) r.error(where, `<${name}> has a transform — bake it into the coordinates`);
    if (a.fill && !/^(none|currentColor)$/.test(a.fill.replace(/['"]/g, ''))) r.error(where, `<${name}> fill="${a.fill}" — icons are stroke-only (fill="none") or currentColor`);
    for (const k of ['stroke', 'color']) if (a[k] && !/^(currentColor|none)$/.test(a[k].replace(/['"]/g, ''))) r.error(where, `<${name}> ${k}="${a[k]}" — use currentColor`);
    for (const k of ['strokeWidth', 'stroke-width']) if (a[k]) r.warn(where, `<${name}> sets ${k} — stroke width comes from <Icon>`);
    const n = (k) => parseFloat(String(a[k] ?? '').replace(/['"]/g, ''));
    if (name === 'path' && a.d) pts.push(...pathPoints(a.d.replace(/^['"]|['"]$/g, '')));
    if (name === 'circle') { const [cx, cy, rr] = [n('cx'), n('cy'), n('r')]; pts.push([cx - rr, cy - rr], [cx + rr, cy + rr]); }
    if (name === 'ellipse') { const [cx, cy, rx, ry] = [n('cx'), n('cy'), n('rx'), n('ry')]; pts.push([cx - rx, cy - ry], [cx + rx, cy + ry]); }
    if (name === 'line') pts.push([n('x1'), n('y1')], [n('x2'), n('y2')]);
    if (name === 'rect') { const [x, y, w, h] = [n('x') || 0, n('y') || 0, n('width'), n('height')]; pts.push([x, y], [x + w, y + h]); }
    if (name === 'polyline' || name === 'polygon') {
      const nums = (a.points || '').match(/-?[\d.]+/g)?.map(Number) || [];
      for (let k = 0; k + 1 < nums.length; k += 2) pts.push([nums[k], nums[k + 1]]);
    }
  }
  const good = pts.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (!good.length) { r.warn(where, 'no geometry found'); return; }
  const xs = good.map((p) => p[0]), ys = good.map((p) => p[1]);
  const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map((v) => +v.toFixed(2));
  if (box[0] < 1 || box[1] < 1 || box[2] > 23 || box[3] > 23) r.error(where, `geometry spans ${box.join(',')} — keep it inside the 1–23 live area`);
  const w = box[2] - box[0], h = box[3] - box[1];
  if (Math.max(w, h) < 14) r.warn(where, `only ${w.toFixed(1)}×${h.toFixed(1)} — looks small next to library icons (keylines: circle Ø20, square 18)`);
  r.info(where, `bounds ${box.join(',')}`);
}

if (existsSync(customDir)) {
  for (const name of readdirSync(customDir)) {
    const file = join(customDir, name);
    const src = readFileSync(file, 'utf8');
    if (name.endsWith('.svg')) {
      const root = src.match(/<svg[^>]*>/)?.[0] || '';
      if (!/viewBox=["']0 0 24 24["']/.test(root)) r.error(rel(file), 'viewBox must be "0 0 24 24"');
      checkGeometry(file, src.replace(/<svg[^>]*>/, ''));
    } else if (/\.(tsx|jsx)$/.test(name)) {
      const calls = [...src.matchAll(/customIcon\(\s*['"]([\w-]+)['"]\s*,([\s\S]*?)\)\s*;/g)];
      if (!calls.length) r.warn(rel(file), 'no customIcon(...) call — build custom icons with customIcon() so they share stroke and caps');
      if (/<svg/.test(src)) r.error(rel(file), 'raw <svg> — use customIcon(name, <>…</>) instead');
      for (const c of calls) checkGeometry(`${file}#${c[1]}`, c[2]);
    }
  }
} else r.info(customDir, 'no custom icons');

r.print('lint_icons');
process.exit(r.errors ? 1 : 0);
