#!/usr/bin/env node
// Eval harness, step 2 (after the runs): build each run's app the same way, screenshot it,
// and write config-neutral measurements to outputs/shots/checks.json for blind graders.
//   node evals/check_app.mjs <iteration_dir>
// Routes come from evals.json ("routes", default ["/"]). DESIGN.md is ignored on purpose so
// both configs are measured identically.
import { execSync, spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SHOOT = join(HERE, '..', 'scripts', 'shoot.mjs');
const it = process.argv[2];
const evals = JSON.parse(readFileSync(join(HERE, 'evals.json'), 'utf8')).evals;
const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;
const ICON_PKGS = ['lucide-react', '@tabler/icons-react', '@phosphor-icons/react', 'react-icons', '@heroicons/react', '@radix-ui/react-icons', '@mui/icons-material', 'react-feather', '@iconify/react'];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out); else if (/\.(tsx|jsx|ts|js|html)$/.test(n)) out.push(p);
  }
  return out;
}

for (const ed of readdirSync(it).filter((d) => d.startsWith('eval-')).sort()) {
  const e = evals.find((x) => ed === `eval-${x.id}-${x.name}`);
  const routes = e?.routes || ['/'];
  for (const cfg of readdirSync(join(it, ed)).filter((d) => statSync(join(it, ed, d)).isDirectory())) {
    for (const run of readdirSync(join(it, ed, cfg)).filter((d) => d.startsWith('run-'))) {
      const out = join(it, ed, cfg, run, 'outputs');
      const app = join(out, 'app');
      const shots = join(out, 'shots');
      mkdirSync(shots, { recursive: true });
      const checks = { routes, build: 'missing app' };
      if (existsSync(join(app, 'package.json'))) {
        const b = spawnSync('npm', ['run', 'build'], { cwd: app, encoding: 'utf8' });
        checks.build = b.status === 0 ? 'ok' : `failed: ${(b.stdout + b.stderr).split('\n').filter((l) => /error/i.test(l)).slice(0, 3).join(' | ')}`;
      }
      if (checks.build === 'ok') {
        spawnSync('node', [SHOOT, join(app, 'dist'), '--routes', routes.join(','), '--widths', '1440,390', '--out', shots, '--design', 'none'], { encoding: 'utf8' });
        const rep = existsSync(join(shots, 'report.json')) ? JSON.parse(readFileSync(join(shots, 'report.json'), 'utf8')) : [];
        checks.pages = rep.map((p) => ({
          route: p.route, width: p.width, screenshot: basename(p.screenshot),
          pageErrors: p.errors, failedRequests: p.failed, horizontalOverflow: p.overflow,
          contrastFailures: p.contrast, fontsLoaded: p.fontsLoaded, vietnameseFallback: p.fontFallback,
          huesInUse: p.hues.map((h) => h.hue), tinyText: p.tiny.length, smallTargets: p.targets.length,
          textInvisibleAfterScroll: p.hidden.length,
        }));
        execSync(`rm -f ${JSON.stringify(join(shots, 'report.json'))}`);
      }
      const src = walk(join(app, 'src')).concat(existsSync(join(app, 'index.html')) ? [join(app, 'index.html')] : []);
      let emoji = 0; let rawColors = 0; let inlineSvg = 0;
      for (const f of src) {
        const text = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
        emoji += [...text].filter((ch) => EMOJI.test(ch)).length;
        rawColors += (text.match(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/g) || []).length;
        inlineSvg += (text.match(/<svg[\s>]/g) || []).length;
      }
      const pkg = existsSync(join(app, 'package.json')) ? JSON.parse(readFileSync(join(app, 'package.json'), 'utf8')) : {};
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      checks.source = { emojiCharacters: emoji, iconPackages: ICON_PKGS.filter((p) => deps[p]), inlineSvgElements: inlineSvg, rawColorLiteralsInSrc: rawColors };
      writeFileSync(join(shots, 'checks.json'), JSON.stringify(checks, null, 1));
      const errs = (checks.pages || []).reduce((n, p) => n + p.pageErrors.length + p.horizontalOverflow.length + p.contrastFailures.length + p.vietnameseFallback.length, 0);
      console.log(`${ed}/${cfg}/${run}: build ${checks.build}, ${checks.pages?.length || 0} shots, ${errs} runtime problems, hues ${[...new Set((checks.pages || []).flatMap((p) => p.huesInUse))].join(',')}`);
    }
  }
}
