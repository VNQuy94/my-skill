// Shared helpers for ui-craft scripts: dependency loading, DESIGN.md parsing, color math.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';

export const HOME = process.env.UI_CRAFT_HOME
  || join(process.env.XDG_CACHE_HOME || join(os.homedir(), '.cache'), 'ui-craft');
export const NODE_DIR = join(HOME, 'node');
export const GF_META = join(HOME, 'gf-meta.json');

const req = createRequire(join(NODE_DIR, 'package.json'));

export function depPath(name) {
  try { return req.resolve(name); } catch { return null; }
}

export async function dep(name) {
  const p = depPath(name);
  if (!p) {
    console.error(`missing dependency "${name}" — run <ui-craft>/scripts/setup.sh`);
    process.exit(2);
  }
  const m = await import(pathToFileURL(p).href);
  return m.default && typeof m.default === 'object' ? { ...m.default, ...m } : m;
}

export function moduleDir(name) {
  // directory of an installed package (e.g. icon SVG sources)
  const p = join(NODE_DIR, 'node_modules', name);
  return existsSync(p) ? p : null;
}

// ---------- DESIGN.md ----------

export async function loadDesign(file = 'DESIGN.md') {
  if (!existsSync(file)) {
    console.error(`${file} not found. Create it from <ui-craft>/assets/DESIGN.template.md`);
    process.exit(2);
  }
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)/);
  if (!m) {
    console.error(`${file}: missing YAML front matter between --- lines`);
    process.exit(2);
  }
  const YAML = await dep('yaml');
  let tokens;
  try { tokens = YAML.parse(m[1]); } catch (e) {
    console.error(`${file}: YAML error: ${e.message}`);
    process.exit(2);
  }
  return { tokens: tokens || {}, body: text.slice(m[0].length), text };
}

// font stack for a font token: { family, fallback } or a plain string
export function fontStack(f) {
  if (!f) return null;
  if (typeof f === 'string') return f;
  const fam = f.family;
  const parts = [];
  if (f.variable) parts.push(`"${fam} Variable"`);
  parts.push(`"${fam}"`);
  parts.push(f.fallback || 'sans-serif');
  return parts.join(', ');
}

export function fontFamily(f) {
  return typeof f === 'string' ? f.split(',')[0].replace(/["']/g, '').trim() : f?.family;
}

// ---------- color ----------

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

// returns { r,g,b } gamma-encoded sRGB 0..1, or null
export function parseColor(input) {
  if (input == null) return null;
  const s = String(input).trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
  }
  m = s.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.%]+\s*)?\)$/);
  if (m) {
    const L = m[2] ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
    const C = parseFloat(m[3]);
    const H = (parseFloat(m[4]) * Math.PI) / 180;
    return oklabToRgb(L, C * Math.cos(H), C * Math.sin(H));
  }
  m = s.match(/^rgb\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/);
  if (m) return { r: m[1] / 255, g: m[2] / 255, b: m[3] / 255 };
  return null;
}

function oklabToRgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return { r: clamp01(toGam(r)), g: clamp01(toGam(g)), b: clamp01(toGam(bl)), outOfGamut: [r, g, bl].some((v) => v < -0.002 || v > 1.002) };
}

export function toOklch({ r, g, b }) {
  const R = toLin(r), G = toLin(g), B = toLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(a, bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H, a, b: bb };
}

export function luminance({ r, g, b }) {
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export function contrast(c1, c2) {
  const a = luminance(c1), b = luminance(c2);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function deltaOk(c1, c2) {
  const x = toOklch(c1), y = toOklch(c2);
  return Math.hypot(x.L - y.L, x.a - y.a, x.b - y.b);
}

export function hex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

// ---------- browser ----------

export async function launchBrowser() {
  const pw = await dep('playwright-core');
  const chromium = pw.chromium;
  const candidates = [process.env.UI_CRAFT_CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/microsoft-edge-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  const exe = candidates.find((p) => existsSync(p));
  try {
    return await chromium.launch(exe ? { executablePath: exe } : {});
  } catch (e) {
    console.error(`cannot start Chromium (${exe || 'playwright default'}): ${e.message.split('\n')[0]}`);
    console.error('install chromium, or set UI_CRAFT_CHROME=/path/to/chrome');
    process.exit(2);
  }
}

// ---------- output ----------

export class Report {
  constructor() { this.items = []; }
  error(where, msg) { this.items.push({ level: 'error', where, msg }); }
  warn(where, msg) { this.items.push({ level: 'warn', where, msg }); }
  info(where, msg) { this.items.push({ level: 'info', where, msg }); }
  get errors() { return this.items.filter((i) => i.level === 'error').length; }
  get warnings() { return this.items.filter((i) => i.level === 'warn').length; }
  print(title) {
    const icon = { error: '✗', warn: '!', info: '·' };
    for (const i of this.items) console.log(`${icon[i.level]} ${i.where ? i.where + ': ' : ''}${i.msg}`);
    console.log(`${title}: ${this.errors} error(s), ${this.warnings} warning(s)`);
  }
}
