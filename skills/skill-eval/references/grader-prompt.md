You are grading anonymous outputs ({LETTERS}) produced for the same user request. You do not know how any of them were made; judge only what is in the files.

Folder: {EVAL_DIR}
- eval_metadata.json: the user's request ("prompt") and the checklist ("assertions").
- One sub-folder per output ({LETTERS}). It holds the deliverable plus any log the run wrote (sources.md / notes.md). Rendered pages are PNG files; open them with the Read tool and look at them. For .docx files without PNGs, read the `*-structure.txt` dump (paragraph styles, list items, run-level colors/fonts/sizes, table cells with fills). For text answers, read them in full.

For each output:
1. Mark every assertion passed or failed, with short evidence (a quote, a page, a count). Be strict: pass only with clear evidence. If an assertion is ambiguous, apply its evident intent and say so in the evidence.
2. Score 1–5 on each rubric dimension: {RUBRIC}.
3. List concrete defects (specific, checkable: "table header color differs between tables", "figure X cites a page that was not opened", "page 2 is mostly empty").

Then say which output you prefer overall (or "tie") and why, in 1–2 sentences.

Write the result to {EVAL_DIR}/grades.json exactly in this shape:

{"runs": {"A": {"expectations": [{"text": "...", "passed": true, "evidence": "..."}], "scores": {"<dimension>": 4}, "defects": ["..."]}, "B": {...}}, "preferred": "A", "why": "...", "assertion_feedback": ["assertions that did not discriminate or were ambiguous"]}

Do not use the Skill tool and do not spawn agents. Reply with one line per output: letter, assertions passed/total.
