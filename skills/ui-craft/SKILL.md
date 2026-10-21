---
name: ui-craft
description: Design and build React + Tailwind interfaces with a distinct identity instead of generic "AI slop" — a design direction drawn from the subject, one DESIGN.md token file that Tailwind v4 enforces (default palette, sizes and radii removed), a consistent icon system (one library + a stroke/cap signature + the product's own icons on the same grid), Vietnamese-capable fonts, and browser checks with screenshots. Use it whenever you create or restyle a web page, landing page, app screen, dashboard, component, or design system in React/Tailwind, choose fonts, colors, or icons for a UI, or the user says the UI looks generic, AI-generated, inconsistent, "giao diện", "thiết kế", "UI", "frontend", "đẹp hơn", "có chất riêng", "bộ icon", "AI slop".
---

# ui-craft

Generated interfaces look alike because no decision was made: every choice falls to the most probable default (Inter, a purple gradient, a centered hero over three rounded cards, emoji as icons, a different color per card). Banning those only moves the output to the next default. This skill makes the decisions explicit, writes them into one file, makes Tailwind enforce them, and checks the result in a real browser.

`<skill>` = this skill's directory. First use on a machine: `<skill>/scripts/setup.sh` (no sudo; `--check` to verify).

## Workflow

### 0. Classify the job

- **New design** or **restyle** → steps 1–6.
- **Add to a product that already has DESIGN.md** → read it, then inventory the existing screens' patterns (list layout, filters, buttons, status marks, headers) and reuse them; skip to step 4. Before introducing a control or layout the product does not have yet (tabs, a table header row, cards), express the need with an existing pattern; add something new only when nothing fits, and record it in DESIGN.md.
- **Mode** of the surface: persuade (landing), operate (app, dashboard), read (docs), experience (portfolio). It sets how much boldness is allowed; see `references/direction.md`.

If the user named a look, palette, font, or reference, that wins over everything in this skill.

### 1. Direction (before any code)

Follow `references/direction.md`:

1. Inventory the subject's world: who, where, under what light, first task; materials, objects, vocabulary, era.
2. Propose 2–3 directions that differ in kind. Each card: three character words, one bold move, 4–6 named color roles, faces, layout concept, icon signature, ASCII wireframe.
3. Review each against `references/defaults-2026-10.md` with the swap test ("would this fit a competitor unchanged?"). Revise defaults you cannot justify; say what you changed.
4. Ask the user to choose (or confirm the single direction when they asked you to decide).

### 2. DESIGN.md and tokens

```bash
<skill>/scripts/init.sh <project> --icons lucide|tabler|phosphor   # new or existing project; never overwrites
python3 <skill>/scripts/fonts_vi.py --category serif --uncommon --shuffle   # candidates WITH Vietnamese
python3 <skill>/scripts/fonts_vi.py --check "Family"                        # verify a choice
node <skill>/scripts/tokens.mjs        # in the project: DESIGN.md → src/styles/theme.css + src/icons/icon-config.ts
```

Fill every `__` in DESIGN.md: tokens in the YAML block, the reasons in prose, a first decision-log line. `tokens.mjs` refuses failing contrast pairs and warns on near-duplicate colors, too many hues, cramped Vietnamese line height, crushed tracking, too-close type steps, and fonts without Vietnamese. Install the fonts it prints into `src/styles/fonts.ts`. Details: `references/color.md`, `references/typography.md`.

### 3. Specimen → approval

```bash
node <skill>/scripts/specimen.mjs      # .ui-craft/specimen.png (+ specimen-dark.png)
```

Look at the image yourself first (type with Vietnamese marks, color roles with contrast numbers, the icon set at every size with custom icons beside the library, components in every state), fix what is off, then show it to the user. Changing direction here costs minutes; after the screens are built it costs hours.

### 4. Build

Rules while writing React + Tailwind (`references/react-tailwind.md`, `references/layout-motion.md`):

- **Tokens only.** Color roles (`bg-surface text-ink border-line`), text styles (`type-h2`), radius and shadow tokens. No hex, no `text-sm`, no `bg-slate-*`: they no longer exist in this theme and silently render nothing.
- **Icons only through `<Icon name size label?>`**; new concepts are registered in `src/icons/registry.tsx`; product-specific icons follow `references/icons.md`. Never emoji.
- **Boldness in one place**, the bold move; everything around it quiet. Quiet is not empty: the subject must still be visible on the page.
- **Show the subject.** In persuade and experience modes, give the page at least one subject-specific visual: a component shaped like a real object from the subject's world (found in the step-1 inventory), an SVG illustration in the palette, or a clearly marked photo slot. Type and color alone usually fail the swap test.
- **Group with space before boxes.** Cards only for objects; never nested.
- **Motion:** at most one authored moment; otherwise feedback to actions; name transitioned properties.
- **Every state:** hover, focus-visible, disabled, invalid, loading, empty, error.
- **Real content** from the brief; invented numbers, names, or quotes marked as placeholders. Vietnamese copy follows `vi-writing`.

### 5. Verify (bounded)

```bash
npm run build
node <skill>/scripts/lint_ui.mjs src        # classes outside the theme, raw values, icon/emoji/font rules, slop tells
node <skill>/scripts/lint_icons.mjs         # registry, custom icon geometry, config freshness
node <skill>/scripts/shoot.mjs dist --routes /,<other routes> --dark   # screenshots 1440 + 390, runtime checks
```

Then **look at every screenshot** (Read the PNGs) against the direction and `references/craft-floor.md`: is the bold move visible, is the hierarchy clear in a squint, does mobile work as its own layout, could this be any other product? Apply the **swap test to the screenshot**, not only to the plan: if renaming the product would make the page fit a competitor, the subject is missing; add it before polishing. Fix everything in one batch, re-run once, and stop. Polishing loops past that point rarely improve the design.

### 6. Record

Add to the DESIGN.md decision log what was tried and rejected and why, so later work does not drift back to defaults. Report to the user: the direction, the files changed, the screenshots, and remaining warnings you chose to keep with the reason.

## Hard rules

| Rule | Why |
|---|---|
| DESIGN.md is the only source of visual values | consistency across screens and sessions |
| One icon library + `<Icon>` + registry | one stroke, one metaphor per concept |
| Fonts must support Vietnamese (checked) | otherwise diacritics render in a fallback face |
| Contrast ≥ 4.5:1 text, ≥ 3:1 large text and control boundaries | readability |
| The user's explicit direction beats the defaults list | the list describes defaults, not bans |
| Do not edit generated `theme.css` / `icon-config.ts` | regenerate from DESIGN.md |

## Files

| Path | Purpose |
|---|---|
| `scripts/setup.sh` | install script dependencies under `~/.cache/ui-craft`, cache font metadata, find Chromium |
| `scripts/init.sh` | Vite starter or add DESIGN.md + `src/icons/` to an existing project |
| `scripts/fonts_vi.py` | Google Fonts with Vietnamese: search, filter, shuffle, check |
| `scripts/tokens.mjs` | DESIGN.md → Tailwind v4 `theme.css` + `icon-config.ts`, token checks |
| `scripts/specimen.mjs` | specimen page + screenshot for approval |
| `scripts/lint_ui.mjs` / `lint_icons.mjs` | static checks |
| `scripts/shoot.mjs` | screenshots and browser checks (overflow, contrast, fonts, targets, errors) |
| `assets/DESIGN.template.md`, `assets/icons/`, `assets/starter/` | templates |
| `references/direction.md` | modes, subject inventory, direction cards, swap test |
| `references/defaults-2026-10.md` | dated list of defaults with alternatives |
| `references/typography.md`, `color.md`, `layout-motion.md`, `icons.md` | craft details |
| `references/react-tailwind.md` | wiring, components, states |
| `references/craft-floor.md` | quality checklist |
