#!/usr/bin/env node
// DESIGN.md → Tailwind v4 theme.css, plus checks on the tokens themselves.
// Usage: node tokens.mjs [DESIGN.md] [--out src/styles/theme.css] [--check]
//   --check  validate only, do not write
// The generated theme resets Tailwind's default colors, fonts, text sizes and radii,
// so classes like bg-purple-500 or text-sm stop existing and only the design tokens remain.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadDesign, parseColor, contrast, toOklch, deltaOk, fontStack, fontFamily, GF_META, Report } from './_lib.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const designFile = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out') || 'DESIGN.md';
const out = opt('--out', 'src/styles/theme.css');

const { tokens: t } = await loadDesign(designFile);
const r = new Report();
const STATUS = ['danger', 'success', 'warning', 'info'];

// ---------- structure ----------
for (const key of ['colors', 'fonts', 'type', 'icons']) if (!t[key]) r.error('DESIGN.md', `missing "${key}"`);
// shadcn/ui projects keep their own role names; treat them as aliases of the ui-craft roles
const ALIAS = { canvas: 'background', ink: 'foreground', surface: 'card', 'ink-muted': 'muted-foreground', line: 'border', accent: 'primary', 'on-accent': 'primary-foreground' };
const has = (c, role) => c?.[role] != null || c?.[ALIAS[role]] != null;
const role = (c, name) => (c?.[name] != null ? name : ALIAS[name]);
for (const rl of ['canvas', 'ink', 'accent']) if (!has(t.colors, rl)) r.error('colors', `missing role "${rl}" (or shadcn "${ALIAS[rl]}")`);
if (!t.character || t.character.length !== 3 || t.character.some((w) => /__/.test(w))) r.warn('character', 'give three real character words');
if (!t['bold-move'] || /__/.test(t['bold-move'])) r.warn('bold-move', 'name the one memorable move');
if (!['persuade', 'operate', 'read', 'experience'].includes(t.mode)) r.warn('mode', 'set mode: persuade | operate | read | experience');

// ---------- colors ----------
function checkPalette(colors, label) {
  const parsed = {};
  for (const [name, val] of Object.entries(colors || {})) {
    if (!/^[a-z][a-z0-9-]*$/.test(name)) r.error(label, `"${name}" is not a kebab-case role name`);
    if (/^(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|grey|zinc|neutral|stone|white|black)(-|$)/.test(name)) {
      r.warn(label, `"${name}" names a hue — name the role instead (accent, surface, danger…)`);
    }
    const c = parseColor(val);
    if (!c) { r.error(label, `${name}: cannot parse "${val}" (use #hex or oklch(L C H))`); continue; }
    if (c.outOfGamut) r.warn(label, `${name}: ${val} is outside sRGB and will be clipped`);
    parsed[name] = c;
  }
  const minFor = (fg, bg) => {
    const pairs = [
      ['ink', 'canvas', 4.5], ['ink', 'surface', 4.5], ['ink-muted', 'canvas', 4.5], ['ink-muted', 'surface', 4.5],
      ['on-accent', 'accent', 4.5], ['accent', 'canvas', 3],
    ].map(([a, b, m]) => [role(colors, a), role(colors, b), m]);
    for (const n of Object.keys(parsed)) {
      if (n.startsWith('on-') && parsed[n.slice(3)]) pairs.push([n, n.slice(3), 4.5]);
      if (n.endsWith('-foreground') && parsed[n.replace(/-foreground$/, '')]) pairs.push([n, n.replace(/-foreground$/, ''), 4.5]);
    }
    for (const p of t.contrast || []) pairs.push(p);
    return pairs;
  };
  for (const [fg, bg, min] of minFor()) {
    if (!parsed[fg] || !parsed[bg]) continue;
    const cr = contrast(parsed[fg], parsed[bg]);
    if (cr < min) r.error(label, `contrast ${fg} on ${bg} = ${cr.toFixed(2)}:1, needs ≥ ${min}:1`);
  }
  // color budget: chromatic roles other than status
  const chroma = Object.entries(parsed).filter(([n, c]) => toOklch(c).C > 0.06 && !STATUS.some((s) => n === s || n === `on-${s}` || n === 'destructive') && !n.startsWith('on-') && !n.endsWith('-foreground') && n !== 'ring');
  const hues = [];
  for (const [n, c] of chroma) {
    const near = hues.find(([, h]) => deltaOk(h, c) < 0.08);
    if (near) r.warn(label, `${n} and ${near[0]} are near-identical colors — one role or two clearly different ones`);
    else hues.push([n, c]);
  }
  if (hues.length > 2) r.warn(label, `${hues.length} distinct chromatic colors (${hues.map((h) => h[0]).join(', ')}) — besides status colors, more than an accent and one secondary hue usually breaks cohesion`);
  return parsed;
}
const light = checkPalette(t.colors, 'colors');
if (t.dark) {
  const missing = Object.keys(t.colors || {}).filter((k) => !(k in t.dark));
  if (missing.length) r.warn('dark', `no dark value for: ${missing.join(', ')} (light value will be used)`);
  checkPalette({ ...t.colors, ...t.dark }, 'dark');
}

// ---------- fonts ----------
let gf = null;
if (existsSync(GF_META)) { try { gf = JSON.parse(readFileSync(GF_META, 'utf8')); } catch {} }
const OVERUSED = ['inter', 'roboto', 'open sans', 'lato', 'arial', 'helvetica', 'poppins', 'montserrat', 'space grotesk', 'system-ui'];
for (const [role, f] of Object.entries(t.fonts || {})) {
  const fam = fontFamily(f);
  if (!fam || /__/.test(fam)) { r.error('fonts', `${role}: no family`); continue; }
  if (OVERUSED.includes(fam.toLowerCase())) r.warn('fonts', `${role}: "${fam}" is a default face; keep it only if the brief asks for it or it is a deliberate choice recorded in the decision log`);
  if (gf) {
    const meta = gf.families[fam.toLowerCase()];
    if (!meta) r.info('fonts', `${role}: "${fam}" is not on Google Fonts — verify Vietnamese glyphs yourself (fc-list ':lang=vi' family)`);
    else {
      if (!meta.vi) r.error('fonts', `${role}: "${fam}" has NO Vietnamese subset — diacritics will fall back to another font`);
      if (typeof f === 'object' && f.variable && !meta.variable) r.error('fonts', `${role}: "${fam}" is not a variable font; set variable: false`);
      if (typeof f === 'object' && f.variable === false && meta.variable) r.info('fonts', `${role}: "${fam}" is variable; variable: true loads one file for all weights`);
    }
  } else r.info('fonts', 'Google Fonts metadata not cached — run fonts_vi.py once so Vietnamese support can be checked');
}

// ---------- type ----------
const remPx = (v) => { const m = String(v).match(/^([\d.]+)(rem|px)$/); return m ? (m[2] === 'rem' ? m[1] * 16 : +m[1]) : null; };
for (const [name, s] of Object.entries(t.type || {})) {
  if (!s.font || !t.fonts?.[s.font]) r.error('type', `${name}: font "${s.font}" is not a key of fonts`);
  const px = remPx(s.size);
  if (px == null) r.error('type', `${name}: size must be rem or px`);
  if (name === 'body' && px && px < 16) r.warn('type', `body is ${px}px; 16px is the readable floor on screens`);
  if (px && px < 12) r.warn('type', `${name} is ${px}px — too small to read`);
  if (s.line && name === 'body' && s.line < 1.5) r.warn('type', `body line-height ${s.line} — Vietnamese stacked diacritics need ≥ 1.5`);
  if (s.line && s.line < 1.1) r.warn('type', `${name} line-height ${s.line} — stacked marks (ế, ổ, ẫ) collide or clip below ~1.1`);
  const tr = parseFloat(s.tracking);
  if (tr < -0.04) r.warn('type', `${name} tracking ${s.tracking} is crushed (floor -0.04em)`);
}
const sizes = Object.values(t.type || {}).map((s) => remPx(s.size)).filter(Boolean).sort((a, b) => a - b);
for (let i = 1; i < sizes.length; i++) if (sizes[i] !== sizes[i - 1] && sizes[i] / sizes[i - 1] < 1.06) r.warn('type', `sizes ${sizes[i - 1]}px and ${sizes[i]}px are too close to read as different levels`);

// ---------- shape, icons ----------
if (t.radius && Object.keys(t.radius).length > 4) r.warn('radius', `${Object.keys(t.radius).length} radii — hierarchy reads better with 2–4`);
const lib = t.icons?.library;
if (!['lucide', 'tabler', 'phosphor'].includes(lib)) r.error('icons', 'library must be lucide, tabler or phosphor');
if (lib === 'phosphor' && t.icons.stroke) r.warn('icons', 'phosphor icons are filled shapes; use weight, not stroke');
if (lib !== 'phosphor' && !(t.icons?.stroke > 0)) r.error('icons', 'set stroke (e.g. 1.5, 1.75, 2)');

// ---------- emit ----------
const lines = [];
const P = (s = '') => lines.push(s);
P(`/* Generated by ui-craft/scripts/tokens.mjs from ${designFile}. Edit DESIGN.md, then regenerate. */`);
P(`/* Import after tailwind:  @import "tailwindcss";  @import "./theme.css"; */`);
P('@theme {');
P('  --color-*: initial;');
P('  --font-*: initial;');
P('  --text-*: initial;');
P('  --radius-*: initial;');
P('  --shadow-*: initial;  /* elevation only from DESIGN.md shadow tokens */');
for (const [n, v] of Object.entries(t.colors || {})) P(`  --color-${n}: ${v};`);
for (const [n, f] of Object.entries(t.fonts || {})) P(`  --font-${n}: ${fontStack(f)};`);
P(`  --default-font-family: var(--font-body);`);
if (t.fonts?.mono) P(`  --default-mono-font-family: var(--font-mono);`);
for (const [n, s] of Object.entries(t.type || {})) {
  P(`  --text-${n}: ${s.size};`);
  if (s.line) P(`  --text-${n}--line-height: ${s.line};`);
  if (s.tracking) P(`  --text-${n}--letter-spacing: ${s.tracking};`);
  if (s.weight) P(`  --text-${n}--font-weight: ${s.weight};`);
}
for (const [n, v] of Object.entries(t.radius || {})) P(`  --radius-${n}: ${v};`);
for (const [n, v] of Object.entries(t.shadow || {})) P(`  --shadow-${n}: ${v};`);
if (t.spacing) P(`  --spacing: ${t.spacing};`);
if (t.motion?.ease) P(`  --ease-brand: ${t.motion.ease};`);
P('}');
P();
P(':root {');
if (t.motion?.fast) P(`  --motion-fast: ${t.motion.fast};`);
if (t.motion?.base) P(`  --motion-base: ${t.motion.base};`);
P(`  --icon-stroke: ${t.icons?.stroke ?? 2};`);
P('  color-scheme: ' + (t.dark ? 'light dark' : 'light') + ';');
P('}');
if (t.dark) {
  const body = Object.entries(t.dark).map(([n, v]) => `  --color-${n}: ${v};`).join('\n');
  P();
  P('@media (prefers-color-scheme: dark) {');
  P('  :root:not([data-theme="light"]) {');
  P(body.replace(/^/gm, '  '));
  P('  }');
  P('}');
  P(':root[data-theme="dark"] {');
  P(body);
  P('}');
}
P();
for (const [n, s] of Object.entries(t.type || {})) {
  P(`@utility type-${n} {`);
  P(`  font-family: var(--font-${s.font});`);
  P(`  font-size: var(--text-${n});`);
  if (s.line) P(`  line-height: var(--text-${n}--line-height);`);
  if (s.tracking) P(`  letter-spacing: var(--text-${n}--letter-spacing);`);
  if (s.weight) P(`  font-weight: var(--text-${n}--font-weight);`);
  P('}');
}
P();
P('@layer base {');
P(`  html { background-color: var(--color-${role(t.colors, 'canvas')}); color: var(--color-${role(t.colors, 'ink')}); font-family: var(--font-body); }`);
if (t.type?.body) P('  body { font-size: var(--text-body); line-height: var(--text-body--line-height); }');
P(`  ::selection { background-color: color-mix(in oklab, var(--color-${role(t.colors, 'accent')}) 28%, transparent); }`);
P(`  :focus-visible { outline: 2px solid var(--color-${role(t.colors, 'accent')}); outline-offset: 2px; }`);
P(`  input, textarea { caret-color: var(--color-${role(t.colors, 'accent')}); }`);
if (has(t.colors, 'line')) P(`  *, ::before, ::after { border-color: var(--color-${role(t.colors, 'line')}); }`);
P('  @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; scroll-behavior: auto !important; } }');
P('}');

r.print(`tokens (${designFile})`);
if (r.errors) process.exit(1);
if (!flag('--check')) {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, lines.join('\n') + '\n');
  console.log(`wrote ${out}`);
  const iconsOut = opt('--icons-out', 'src/icons/icon-config.ts');
  if (existsSync(dirname(iconsOut))) {
    const sz = (t.icons?.sizes || [16, 20, 24]).slice().sort((a, b) => a - b);
    const names = sz.length === 3 ? ['sm', 'md', 'lg'] : ['xs', 'sm', 'md', 'lg', 'xl'].slice(0, sz.length);
    const cfg = {
      library: lib,
      stroke: t.icons?.stroke ?? 2,
      weight: t.icons?.weight ?? 'regular',
      cap: t.icons?.cap ?? 'round',
      join: t.icons?.join ?? 'round',
      sizes: Object.fromEntries(names.map((n, i) => [n, sz[i]])),
    };
    writeFileSync(iconsOut, `// Generated by ui-craft/scripts/tokens.mjs from ${designFile}. Edit DESIGN.md, then regenerate.\nexport const iconConfig = ${JSON.stringify(cfg, null, 2)} as const;\n`);
    console.log(`wrote ${iconsOut}`);
  }
  const fams = Object.values(t.fonts || {}).filter((f) => typeof f === 'object');
  if (fams.length) {
    console.log('fonts to self-host (npm):');
    for (const f of fams) {
      const slug = f.family.toLowerCase().replace(/\s+/g, '-');
      console.log(f.variable ? `  @fontsource-variable/${slug}   → import "@fontsource-variable/${slug}";`
        : `  @fontsource/${slug}   → import "@fontsource/${slug}/400.css"; (one import per weight used)`);
    }
  }
}
