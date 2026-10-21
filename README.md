<div align="center">

# 🧰 My-Skill

**A personal library of Agent Skills for Claude Code and other coding agents.**

Small, tested, version-controlled instructions that make an agent work the way I do.

![Claude Code](https://img.shields.io/badge/Claude_Code-skills-D97757?style=flat-square)
![Agent Skills](https://img.shields.io/badge/format-SKILL.md-4B5563?style=flat-square)
![Skills](https://img.shields.io/badge/skills-6-2563EB?style=flat-square)
![Shell](https://img.shields.io/badge/tooling-bash-16A34A?style=flat-square)

[Skills](#-skills) · [Install](#-install-on-a-new-machine) · [Quick start](#-quick-start) · [Structure](#-repository-structure) · [Writing a skill](#-writing-a-skill) · [Testing](#-testing-skills)

</div>

---

## ✨ Overview

Each skill is a folder with a `SKILL.md` file. The agent sees only the skill's `name` and `description` until a task matches. Then it loads the full instructions, and reads the reference files only when it needs them.

This repo is the single source of truth. Skills are installed with **symlinks**, so an edit here takes effect immediately in every project. You do not need to reinstall after a change.

## 📚 Skills

| Skill | What it does | Use it when |
|---|---|---|
| [`research`](skills/research/SKILL.md) | Research methodology. It covers choosing research depth, crafting search queries, judging sources, citing them, and deciding when to stop. | An answer depends on facts that may be stale, niche, or contested. Also for comparing tools, debugging an error message, making a recommendation, or learning a new domain. |
| [`doc-style`](skills/doc-style/SKILL.md) | Consistent document layout for PDF (Typst) and DOCX (docx-js): one profile holds every font, size, spacing, and color role; helpers build tables, callouts, key figures, and figures; linters catch off-palette colors, direct formatting, and walls of text. Includes a Decree 30/2020 profile for Vietnamese administrative documents. | Creating or restyling a report, proposal, guide, or official notice as `.pdf` or `.docx`, or when a document looks messy or inconsistent. |
| [`vi-writing`](skills/vi-writing/SKILL.md) | Natural, correct Vietnamese: capitalisation per Decree 30/2020 Appendix II, one spelling convention per document (kỉ/kỷ, hoà/hòa), Vietnamese number/date formats, punctuation, technical terms, and rewriting translationese. Includes a consistency linter. | Writing, translating, or proofreading Vietnamese documents, guides, notices, emails, or UI text. |
| [`linux-desktop`](skills/linux-desktop/SKILL.md) | Safe operation of a CachyOS/Arch + COSMIC (Wayland) desktop: inspect first, plan with undo, hand root commands to the user, full upgrades and `.pacnew` merges, snapper/Limine snapshots, portals and remote desktop. | Installing, updating, configuring, or troubleshooting anything on the machine. |
| [`ui-craft`](skills/ui-craft/SKILL.md) | Distinctive React + Tailwind interfaces instead of generic "AI slop": a design direction drawn from the subject, one `DESIGN.md` token file that Tailwind v4 enforces (default palette, text sizes, radii and shadows removed), an icon system (one library + a stroke/cap signature + the product's own icons on the same grid), Vietnamese-capable fonts, a specimen page for approval, linters, and browser checks with screenshots. | Building or restyling a landing page, app screen, dashboard, or component, choosing fonts, colors, or icons, or when a UI looks generic or inconsistent. |
| [`skill-eval`](skills/skill-eval/SKILL.md) | Fair, blind evaluation of a skill: leakage check, ready-made run prompts, timing, blinding with page renders, grader prompts, unblinding, and a results report. | Testing whether a skill helps, or whether a new version beats the old one. |

<details>
<summary><b>Inside <code>research</code></b></summary>

| File | Purpose |
|---|---|
| `SKILL.md` | Core workflow: anchor → choose mode → plan → search loop → gap check → answer |
| `references/modes.md` | Five research depths (direct, practical, decision, discovery, current state) with effort guardrails |
| `references/query-crafting.md` | Query length, query language (English vs. Vietnamese), `site:`, error strings, templates, worked examples |
| `references/search-strategy.md` | Query families, breadth-then-depth traversal, conflict handling |
| `references/evidence.md` | Claim-to-source discipline, red flags in sources, evidence independence |
| `references/discovery.md` | Mapping an unfamiliar domain without anchoring on prior knowledge |
| `references/reasoning-and-explanation.md` | Turning findings into an explanation or conditional recommendation |
| `references/parallel-research.md` | Parallel searches and subagent briefs for large tasks |
| `evals/` | Test prompts, assertions, validation scenarios, and recorded results |

</details>

<details>
<summary><b>Inside <code>doc-style</code></b></summary>

| File | Purpose |
|---|---|
| `SKILL.md` | Workflow: setup → profile → layout plan → write with helpers → build → lint → render and look → deliver |
| `assets/profiles/` | `modern`, `formal`, `nd30`: the single source of fonts, sizes, spacing, and color roles |
| `assets/theme.typ` | Typst theme and helpers (`data-table`, `callout`, `stat`, `fig`, `nd30-header`, `nd30-signature`) |
| `assets/docx-theme.js` | docx-js named styles and the same helpers for Word output |
| `references/` | Content shape → form, component and color-role rules, Decree 30/2020 layout |
| `scripts/` | `setup.sh`, `new_doc.py`, `build.py`, `lint_pdf.py`, `lint_docx.py`, `render.sh`, `check_profile.py`, `chart_theme.py` |
| `evals/` | Test prompts, a profile-independent metrics script, recorded results |

</details>

<details>
<summary><b>Inside <code>ui-craft</code></b></summary>

| File | Purpose |
|---|---|
| `SKILL.md` | Workflow: classify → direction (2–3 cards, swap test) → DESIGN.md + tokens → specimen for approval → build → lint + screenshots → decision log |
| `scripts/tokens.mjs` | `DESIGN.md` → Tailwind v4 `theme.css` (defaults reset) and `icon-config.ts`; contrast, color-budget, type, and font checks |
| `scripts/fonts_vi.py` | Google Fonts families with Vietnamese support: filter, shuffle, check |
| `scripts/specimen.mjs` | Type, color roles (light/dark), icon set with custom icons, components in every state → PNG |
| `scripts/lint_ui.mjs`, `lint_icons.mjs` | Classes the theme does not define, raw values, icon and emoji rules, custom-icon geometry |
| `scripts/shoot.mjs` | Screenshots at 1440/390 plus overflow, contrast, font-fallback, hue-count, and target checks |
| `assets/` | `DESIGN.template.md`, `Icon.tsx` + registries for Lucide/Tabler/Phosphor, icon grid, Vite starter |
| `references/` | Direction, dated defaults list, typography, color, layout and motion, icons, React/Tailwind wiring, quality floor |
| `evals/` | Prompts, a fixture project, and the screenshot harness for blind grading |

</details>

## 💻 Install on a new machine

```bash
git clone <repo-url> ~/Documents/My-Skill
cd ~/Documents/My-Skill
scripts/install.sh            # link skills into ~/.claude/skills + run each skill's setup
scripts/install.sh --agents   # same, and also link into ~/.agents/skills
```

`install.sh` is safe to re-run. It never overwrites a real folder in the skills directory, only symlinks.

**Requirements**

| Needed for | Requirement |
|---|---|
| all skills | `git`, `bash` |
| `doc-style` | `python3` (with `venv`), `node` + `npm`, poppler (`pdftoppm`, `pdffonts`) |
| `doc-style`, recommended | fonts with Vietnamese glyphs: Inter, Noto Sans/Serif, Liberation Serif |
| `doc-style`, optional | LibreOffice (`soffice`) to preview DOCX as images |
| `ui-craft` | `node` ≥ 20 + `npm`, `python3`, Chromium (or `npx playwright install chromium`) |

`doc-style` installs its Python and npm packages into `~/.cache/doc-style` without sudo. Check with `skills/doc-style/scripts/setup.sh --check`. `ui-craft` does the same under `~/.cache/ui-craft` (`skills/ui-craft/scripts/setup.sh --check`).

## 🚀 Quick start

```bash
# 1. Create a skill from the template
scripts/new-skill.sh my-skill

# 2. Write the instructions
$EDITOR skills/my-skill/SKILL.md

# 3. Validate frontmatter and naming
scripts/validate.sh

# 4. Install it (symlink into ~/.claude/skills)
scripts/link.sh my-skill
```

> [!TIP]
> To install for agents that read `~/.agents/skills` instead, run:
> `CLAUDE_SKILLS_DIR=~/.agents/skills scripts/link.sh my-skill`

## 📁 Repository structure

```text
My-Skill/
├── skills/
│   ├── _template/              # starting point for new skills (never linked)
│   │   ├── SKILL.md
│   │   ├── references/         # long docs, loaded only when needed
│   │   └── scripts/            # helper scripts bundled with the skill
│   └── <skill-name>/
│       ├── SKILL.md            # required: frontmatter + instructions
│       ├── references/
│       └── evals/              # test prompts and results
├── scripts/
│   ├── new-skill.sh            # scaffold a skill from the template
│   ├── validate.sh             # check every skill's frontmatter
│   ├── link.sh                 # install / uninstall skills via symlink
│   └── install.sh              # one-shot setup on a new machine
├── workspaces/                 # eval run outputs (git-ignored)
├── CLAUDE.md                   # conventions for Claude when working in this repo
└── README.md
```

## 🔧 Scripts

| Command | Description |
|---|---|
| `scripts/new-skill.sh <name>` | Copies `_template`, fills in the name, and enforces kebab-case names |
| `scripts/validate.sh` | Checks each skill for a `SKILL.md`, valid frontmatter, a `name` that matches its folder, a non-empty `description`, and no leftover placeholders |
| `scripts/link.sh [name]` | Symlinks one skill, or all of them, into `~/.claude/skills`. Skips anything that is not a symlink. |
| `scripts/link.sh --unlink` | Removes only the symlinks that point into this repo |
| `scripts/install.sh [--agents] [--no-setup]` | Links every skill and runs each skill's `scripts/setup.sh` |

## 📝 Writing a skill

- **Name**: kebab-case. It must match the folder name and the `name` field.
- **Description**: say what the skill does *and* when to use it. The agent uses this field to decide whether to load the skill.
- **Keep `SKILL.md` lean**: put long material in `references/` and point to it with a note on when to read it.
- **Explain the why**: a reason generalizes better than a rigid `ALWAYS` or `NEVER`.
- **Bundle repeated work**: if every run writes the same helper, put it in `scripts/`.

## 🧪 Testing skills

Skills are evaluated with the repo's own [`skill-eval`](skills/skill-eval/SKILL.md) skill (a streamlined version of the [skill-creator](https://github.com/anthropics/skills) loop):

```bash
python3 skills/skill-eval/scripts/check_leakage.py skills/<name>          # eval topics must not appear in the skill
python3 skills/skill-eval/scripts/init_run.py skills/<name> --iteration N # run prompts for with/without skill
python3 skills/skill-eval/scripts/blind.py workspaces/<name>/iteration-N  # shuffle, render, grader prompts
python3 skills/skill-eval/scripts/unblind.py workspaces/<name>/iteration-N
python3 skills/skill-eval/scripts/report.py workspaces/<name>/iteration-N --record
```

Results are recorded in each skill's `evals/results-<date>.md`.

> [!WARNING]
> Keep the examples inside a skill **on different topics** from the eval prompts. If they overlap, the agent copies the example and the score no longer measures the method.

Latest results: [`research`](skills/research/evals/results-2026-10-10.md) · [`doc-style`](skills/doc-style/evals/results-2026-10-11.md) · [`vi-writing`](skills/vi-writing/evals/results-2026-10-11.md).

---

<div align="center">
<sub>Built and tested with Claude Code.</sub>
</div>
