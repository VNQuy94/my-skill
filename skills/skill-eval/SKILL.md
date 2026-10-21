---
name: skill-eval
description: Run a fair, blind evaluation of an Agent Skill in this repo — check that eval prompts do not leak into the skill, launch with-skill / without-skill / old-version runs from ready-made prompts, record timing, blind and grade the outputs, and write a results report. Use it whenever the user asks to test, evaluate, benchmark, compare, or "kiểm thử" a skill, asks whether a skill actually helps or whether a new version is better, or after creating or substantially editing a skill under skills/. Requires a tool for spawning subagents.
---

# skill-eval

A streamlined, repo-specific version of skill-creator's eval loop. It exists because the same manual steps and the same mistakes kept recurring; `references/pitfalls.md` lists them. Read it once.

`<se>` = this skill's directory. Scripts use only the Python standard library.

## Workflow

### 1. Evals ready and clean

- `skills/<name>/evals/evals.json` exists. Format and advice on prompts/assertions: `references/evals-format.md`. Show new prompts and assertions to the user before running.
- Check for leakage, every time:

```bash
python3 <se>/scripts/check_leakage.py skills/<name>
```

Shared topic words, numbers, or names between a prompt and the skill's examples mean the run will copy the example. Change the example (not the eval) and re-check. Generic phrases are fine.

### 2. Create the iteration

```bash
python3 <se>/scripts/init_run.py skills/<name> --iteration N \
  --configs with_skill,without_skill            # new skill
  # --configs with_skill,old_skill --old <snapshot>   # improved skill (cp -r the old version first)
  # --runs 3                                         # to judge small differences
```

It creates `workspaces/<name>/iteration-N/` with one prompt file per run in `prompts/`. The prompts already ask only for tool-use logs (queries, URLs, commands), never for the run's reasoning, which trips the API's `reasoning_extraction` safeguard.

### 3. Launch all runs in one turn

One Agent call per prompt file, all in the same message, with the file's text as the prompt (general-purpose agent). As each notification arrives:

```bash
python3 <se>/scripts/record_timing.py workspaces/<name>/iteration-N <eval-dir> <config> --tokens T --ms M
```

Read each run's `notes.md`/`sources.md` when it finishes. If a run reports a bug in the skill, fix it, note it, and plan to rerun that eval.

### 4. Blind and grade

```bash
python3 <se>/scripts/blind.py workspaces/<name>/iteration-N
```

Then launch one grader per eval in one turn, using `prompts/grade--<eval>.txt` as the prompt. Never give graders `blind_mapping.json` or config names. Graders write `blind/<eval>/grades.json`.

### 5. Unblind and report

```bash
python3 <se>/scripts/unblind.py workspaces/<name>/iteration-N
python3 <se>/scripts/report.py  workspaces/<name>/iteration-N            # writes report.md
python3 <se>/scripts/report.py  workspaces/<name>/iteration-N --record   # also saves skills/<name>/evals/results-<date>.md
```

Before recording, add what the numbers cannot show with `--note`: bugs found, ambiguous assertions (report both readings if you reinterpret), contamination, runs that failed.

### 6. Tell the user

Lead with the answer to their question ("does the skill help?", "is v2 better?"), then the table, then caveats. With 1 run per cell, differences of one assertion are noise; say so. Recommend the next step: fix bugs and rerun, sharpen non-discriminating assertions, or add runs.

## Files

| Path | Purpose |
|---|---|
| `scripts/check_leakage.py` | shared n-grams, numbers, names between eval prompts and skill files |
| `scripts/init_run.py` | workspace + per-run prompts |
| `scripts/record_timing.py` | save tokens/duration from a notification |
| `scripts/blind.py` | shuffled copies, PDF/DOCX page renders, grader prompts |
| `scripts/unblind.py` | grades → `grading.json` per run |
| `scripts/report.py` | `report.md`, optional copy into the skill's `evals/` |
| `references/grader-prompt.md` | grader instructions template |
| `references/evals-format.md` | evals.json fields, prompt and assertion advice |
| `references/pitfalls.md` | mistakes already made here, and how the scripts prevent them |
