# Parallel Research

Use this for modes C and D, or any task with several **independent** sub-questions. Parallelism saves time and keeps each line of inquiry focused, but it costs tokens and coordination. Do not use it for simple questions.

## Level 1 — Parallel tool calls (default)

When sub-questions do not depend on each other, issue their searches and fetches in the same turn instead of one at a time. Example: in a comparison, search each option's docs, changelog, and limitations together.

## Level 2 — Subagents (only when large)

Use subagents if the host provides them **and** the task has roughly 3+ independent sub-questions that each need several searches (a broad comparison, a domain map, a multi-region survey). A single fact or a two-option comparison does not need them.

| Task shape | Researchers |
|---|---|
| single question, no real decomposition | 0 (do it yourself) |
| focused topic with a few angles | 2–3 |
| distinct facets or several entities | 3–5 |

### Writing the brief

A subagent cannot see your conversation or the other subagents. Vague briefs cause duplicated or misdirected work. Each brief needs:

```text
Research: <one narrow topic>
Objective: <what the output must cover and why it matters to the user>
Key questions:
- <specific question 1>
- <specific question 2>
Sources to prefer: <official docs / issues / papers / Vietnamese official sites …>
Constraints: today's date is <date>; <version, region, language, user context>
Query language: <English / Vietnamese / both>
Budget: about 5–10 tool calls; stop early if two rounds add nothing new
Output: save notes to <absolute path>, using the format below
```

Spell out acronyms and the user's context in the brief. The subagent knows nothing else.

### Notes format for each researcher

```markdown
# <Topic>

## <Key question>
### Takeaway
1–2 sentences.
### Cited findings
- <fact> — [Source](URL)
- <fact> — [Source A](URL); contradicted by [Source B](URL)
### Inferences
- <reasoning based on the findings above>
### Gaps
- <what could not be answered, and why>
```

Every finding carries a source; anything unsourced goes to Gaps.

### Synthesis

Read every notes file, then apply the gap check in `SKILL.md` Step 4 to the combined picture. Run at most **one** extra targeted round for a gap that could change the conclusion, then answer.
