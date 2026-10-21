# evals.json format

Lives at `skills/<name>/evals/evals.json`. Compatible with skill-creator's format, plus a few optional fields used by `init_run.py` and `blind.py`.

```json
{
  "skill_name": "doc-style",
  "tools_note": "Optional sentence added to every run prompt, e.g. which venv/tooling exists.",
  "log": "sources",
  "rubric": ["consistency", "readability", "visual structure", "fidelity"],
  "evals": [
    {
      "id": 1,
      "name": "kebab-case-name",
      "prompt": "The exact message a real user would send, with their details.",
      "expected_output": "What a good result contains (for humans; not shown to runs).",
      "deliverable": "report.pdf",
      "log": "commands",
      "rubric": ["accuracy", "citation quality"],
      "files": [],
      "assertions": [
        "Checkable statement 1",
        "Checkable statement 2"
      ]
    }
  ]
}
```

| Field | Default | Meaning |
|---|---|---|
| `deliverable` | `answer.md` | file the run must leave in `outputs/`; a folder name (e.g. `shots`) means graders get its PNG/JSON/MD files only — use it for UI work, where screenshots plus neutral measurements are graded and sources would reveal the config |
| `run_deliverable` | – | what the run itself must leave (e.g. `app/` built), when `deliverable` is produced from it afterwards by a harness (e.g. screenshots) |
| `log` | `sources` | `sources` = queries + opened URLs, `commands` = commands + final check output, `none` |
| `rubric` | accuracy, completeness, clarity, usefulness | 1–5 score dimensions for the grader (eval-level overrides top-level) |
| `tools_note` | – | same sentence for every config, so tooling is equal and only the skill differs |
| `files` | `[]` | input files the run should use |
| `grader_sees_log` | `false` | copy `notes.md` to graders as `commands-log.md`, with lines naming the skill redacted — use for agentic skills where the process (what was inspected or run) is part of the grade |

## Writing good prompts

- Write what a real user would type, in their language, with real details (numbers, names, constraints). Abstract prompts ("make a report") do not exercise a skill.
- Cover different modes of the skill: a simple case that should **not** trigger heavy behavior, a typical case, and a hard or edge case.
- **Use topics that appear nowhere in the skill.** Run `check_leakage.py` after writing them.

## Writing good assertions

- Objectively checkable from the files: counts, presence, format, a specific fact. Not "is high quality".
- Say exactly what counts: "links placed next to the claims in the body (an end list alone does not count)", "an official government source such as chinhphu.vn or *.gov.vn".
- Include at least one assertion the baseline is likely to fail; an assertion everyone passes measures nothing.
- Quality that cannot be checked mechanically goes into the rubric, not into assertions.
