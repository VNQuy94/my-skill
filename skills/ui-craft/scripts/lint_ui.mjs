#!/usr/bin/env node
// Static checks of React + Tailwind source against DESIGN.md.
// Usage: node lint_ui.mjs [src] [--design DESIGN.md] [--json]
// Exit 1 when there are errors. Silence one line with a comment containing "ui-craft-ignore".
//
// Errors: classes that produce no CSS under the generated theme (bg-purple-500, text-sm…),
// raw colors and raw font sizes, a second icon library or icon imports outside src/icons,
// emoji used as icons, transition-all, fonts outside the tokens.
// Warnings: tells of generated pages (tracked all-caps labels, gradient text, decorative
// bounce/ping/pulse, arrow glyphs in text, inline <svg> outside src/icons, off-scale spacing).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { loadDesign, fontFamily, Report } from './_lib.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const root = args.find((a, i) => !a.startsWith('--') && !['--design'].includes(args[i - 1])) || 'src';
const { tokens: t } = await loadDesign(opt('--design', 'DESIGN.md'));

const COLORS = new Set([...Object.keys(t.colors || {}), ...Object.keys(t.dark || {}), 'transparent', 'current', 'inherit']);
const TYPE = new Set(Object.keys(t.type || {}));
const FONTS = new Set(Object.keys(t.fonts || {}));
const RADII = new Set([...Object.keys(t.radius || {}), 'none', 'full']);
const SHADOWS = new Set([...Object.keys(t.shadow || {}), 'none']);
const FAMILIES = new Set(Object.values(t.fonts || {}).map((f) => fontFamily(f)?.toLowerCase()));
const ICON_PKGS = { lucide: 'lucide-react', tabler: '@tabler/icons-react', phosphor: '@phosphor-icons/react' };
const ALL_ICON_PKGS = [...Object.values(ICON_PKGS), 'react-icons', '@heroicons/react', '@radix-ui/react-icons', '@mui/icons-material', 'react-feather', '@iconify/react', 'lucide-static', '@tabler/icons'];
const allowedIconPkg = ICON_PKGS[t.icons?.library];

const isColor = (v) => COLORS.has(v.replace(/\/(\d+|\[.*\]|\(.*\))$/, ''));
const WEIGHTS = /^(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/;
const BG_STATIC = /^(fixed|local|scroll|clip-.+|origin-.+|no-repeat|repeat(-.+)?|cover|contain|auto|center|top|bottom|left|right|(left|right)-(top|bottom)|none|linear-.+|radial(-.+)?|conic(-.+)?|gradient-to-.+|blend-.+|size-.+|position-.+|\(.+\)|\[.+\])$/;
const TEXT_STATIC = /^(left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip|shadow(-.+)?|\(.+\)|\[.+\])$/;
const BORDER_STATIC = /^(\d+|x|y|t|b|l|r|s|e|solid|dashed|dotted|double|hidden|none|collapse|separate|spacing(-.+)?|[xytblrse]-\d+|\(.+\)|\[.+\])$/;

function checkClass(raw, add) {
  const cls = raw.replace(/^(?:[a-z0-9@\[\]&*:=_\-\/.]+:)+/, '').replace(/^!|!$/g, '').replace(/^-/, '');
  let m;
  // arbitrary values
  if ((m = cls.match(/^[a-z-]+-\[(#[0-9a-f]{3,8}|(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\(.*)\]$/i))) return add('error', `raw color "${raw}" — add a role to DESIGN.md colors`);
  if (/^text-\[\d/.test(cls)) return add('error', `raw font size "${raw}" — use a type-* style`);
  if (/^(leading|tracking)-\[/.test(cls)) return add('warn', `raw "${raw}" — line height and tracking belong to the type-* style`);
  if (/^rounded(-[a-z]+)?-\[/.test(cls)) return add('warn', `raw radius "${raw}" — use a radius token`);
  if (/^-?(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|space-x|space-y)-\[\d/.test(cls)) return add('warn', `off-scale spacing "${raw}"`);
  if (cls === 'transition-all') return add('error', '"transition-all" — list the properties you animate (transition-colors, transition-transform…)');
  if (/^animate-(bounce|ping)$/.test(cls)) return add('warn', `decorative "${cls}" — motion should answer an action or mark one moment`);

  const [, prefix, rest] = cls.match(/^(bg|text|border(?:-[xytblrse])?|ring|ring-offset|outline|fill|stroke|from|via|to|shadow|rounded(?:-(?:tl|tr|br|bl|ss|se|es|ee|t|r|b|l|s|e))?|font|decoration|divide|placeholder|caret|accent)(?:-(.+))?$/) || [];
  if (!prefix) return;
  const v = rest ?? '';
  const ok = (() => {
    switch (prefix.startsWith('border') ? 'border' : prefix) {
      case 'bg': return isColor(v) || BG_STATIC.test(v);
      case 'text': return isColor(v) || TYPE.has(v) || TEXT_STATIC.test(v);
      case 'border': return v === '' || isColor(v) || BORDER_STATIC.test(v);
      case 'ring': return v === '' || /^(\d+|inset|\(.+\)|\[.+\])$/.test(v) || isColor(v);
      case 'ring-offset': return /^\d+$/.test(v) || isColor(v);
      case 'outline': return v === '' || /^(\d+|none|hidden|dashed|dotted|double|solid|offset-\d+|\(.+\)|\[.+\])$/.test(v) || isColor(v);
      case 'fill': case 'stroke': return /^(none|\d+|\(.+\)|\[.+\])$/.test(v) || isColor(v);
      case 'from': case 'via': case 'to': return /^\d+%$/.test(v) || isColor(v);
      case 'shadow': return SHADOWS.has(v) || isColor(v) || /^(\(.+\)|\[.+\])$/.test(v);
      case 'font': return FONTS.has(v) || WEIGHTS.test(v) || /^(stretch-.+|features-.+|\(.+\)|\[.+\])$/.test(v);
      case 'decoration': return /^(solid|double|dotted|dashed|wavy|auto|from-font|clone|slice|\d+)$/.test(v) || isColor(v);
      case 'divide': return /^(x|y|x-\d+|y-\d+|x-reverse|y-reverse|solid|dashed|dotted|double|none)$/.test(v) || isColor(v);
      case 'placeholder': case 'caret': return isColor(v);
      case 'accent': return v === 'auto' || isColor(v);
      default: // rounded and rounded-<side>
        return RADII.has(v);
    }
  })();
  if (ok) return;
  const hint = prefix === 'text' && /^(xs|sm|base|lg|[2-9]?xl)$/.test(v) ? ' — default text sizes are removed; use type-* styles'
    : prefix.startsWith('rounded') ? ` — radius tokens: ${[...RADII].join(', ')}`
    : prefix === 'shadow' ? ` — shadow tokens: ${[...SHADOWS].join(', ')}`
    : prefix === 'font' ? ` — font tokens: ${[...FONTS].join(', ')}`
    : ` — color roles: ${[...COLORS].filter((c) => !['transparent', 'current', 'inherit'].includes(c)).join(', ')}`;
  add('error', `"${raw}" produces no CSS with this theme${hint}`);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'dist', 'build', '.next', '.git'].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|jsx|ts|js|css|html|mdx)$/.test(name)) out.push(p);
  }
  return out;
}

if (!existsSync(root)) { console.error(`${root} not found`); process.exit(2); }
const files = statSync(root).isDirectory() ? walk(root) : [root];
const r = new Report();
const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;
const ARROWS = /[←-⇿⟵-⟿]/;
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/;
const CLASS_TOKEN = /(?<=^|[\s"'`{(:,])((?:[a-z0-9@\[\]&*=_\-\/.]+:)*!?-?(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|rounded|font|decoration|divide|placeholder|caret|accent|transition|animate|leading|tracking|p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|space)(?:-[^\s"'`{}<>,;]*)?)(?=$|[\s"'`},;)])/g;
let eyebrows = 0;

for (const file of files) {
  const rel = relative(process.cwd(), file);
  if (/(^|[\\/])(theme\.css|icon-config\.ts)$/.test(file)) continue;
  const inIcons = rel.split(sep).includes('icons');
  const isCss = file.endsWith('.css');
  const lines = readFileSync(file, 'utf8').split('\n');
  let inBlockComment = false;
  lines.forEach((line, i) => {
    const where = `${rel}:${i + 1}`;
    if (line.includes('ui-craft-ignore')) return;
    let code = line;
    if (inBlockComment) { if (code.includes('*/')) { code = code.slice(code.indexOf('*/') + 2); inBlockComment = false; } else return; }
    code = code.replace(/\/\*.*?\*\//g, '').replace(/\{\/\*.*?\*\/\}/g, '');
    if (code.includes('/*')) { code = code.slice(0, code.indexOf('/*')); inBlockComment = true; }
    if (!isCss) code = code.replace(/(^|[^:])\/\/.*$/, '$1');
    const trimmed = code.trim();
    if (!trimmed) return;
    const add = (level, msg) => r[level](where, msg);

    // imports
    const imp = code.match(/from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/);
    if (imp) {
      const mod = imp[1] || imp[2];
      const pkg = ALL_ICON_PKGS.find((p) => mod === p || mod.startsWith(p + '/'));
      if (pkg && pkg !== allowedIconPkg) add('error', `icon package "${pkg}" — DESIGN.md uses ${allowedIconPkg} only`);
      else if (pkg && !inIcons) add('error', `import from ${pkg} outside src/icons — register it in src/icons/registry.tsx and use <Icon name>`);
      return;
    }

    if (isCss) {
      if (/@apply\s/.test(code)) for (const m of code.matchAll(CLASS_TOKEN)) checkClass(m[1], add);
      if (RAW_COLOR.test(code) && !/var\(--/.test(code.split(RAW_COLOR)[0] ?? '')) add('error', 'raw color in CSS — use var(--color-<role>)');
      const ff = code.match(/font-family\s*:\s*([^;]+)/);
      if (ff && !/var\(--font/.test(ff[1])) {
        const fam = ff[1].split(',')[0].replace(/["']/g, '').trim().toLowerCase();
        if (!FAMILIES.has(fam) && !/^(inherit|initial|unset)$/.test(fam)) add('error', `font-family "${fam}" is not a DESIGN.md font`);
      }
      if (/transition\s*:\s*all\b/.test(code)) add('error', '"transition: all" — list the properties');
      return;
    }

    for (const m of code.matchAll(CLASS_TOKEN)) checkClass(m[1], add);
    if (RAW_COLOR.test(code) && !inIcons) add('error', 'raw color in code — use a color role class or var(--color-<role>)');
    if (/style=\{\{[^}]*(color|background|fontSize|fontFamily|borderRadius|boxShadow)\s*:/.test(code)) add('warn', 'inline style sets a design value — use token classes');
    if (/transition\s*:\s*['"]all/.test(code)) add('error', '"transition: all" — list the properties');
    if (/\buppercase\b/.test(code) && /\btracking-(wide|wider|widest|\[)/.test(code)) { eyebrows++; add('warn', 'tracked ALL-CAPS label — a common generated-page tell; keep it only if it encodes information'); }
    if (/\bbg-clip-text\b/.test(code) && /\btext-transparent\b/.test(code)) add('warn', 'gradient text — a common generated-page tell');
    if (/<svg[\s>]/.test(code) && !inIcons) add('warn', 'inline <svg> outside src/icons — icons belong in src/icons/custom via customIcon(); illustrations are fine');
    const text = code.replace(/className=("[^"]*"|\{[^}]*\})/g, '');
    if (EMOJI.test(text)) add('error', 'emoji in UI — use <Icon name> (or plain words)');
    else if (ARROWS.test(text) && />[^<]*[←-⇿][^<]*</.test(text)) add('warn', 'arrow glyph in text — use <Icon name="arrow-right"> or drop it');
  });
}

r.print(`lint_ui (${files.length} files)`);
if (eyebrows > 2) console.log(`  note: ${eyebrows} tracked all-caps labels — this pattern is usually template chrome`);
if (args.includes('--json')) console.log(JSON.stringify(r.items, null, 1));
process.exit(r.errors ? 1 : 0);
