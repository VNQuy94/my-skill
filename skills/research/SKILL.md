---
name: research
description: Research methodology for any answer that depends on external evidence. Use it whenever facts may be stale, niche, contested, or consequential; when comparing tools, libraries, vendors, or approaches; when investigating a work problem or an error message; before making a recommendation; when learning an unfamiliar domain; or when the user asks to research, verify, compare, or get the latest/current state (including Vietnamese requests such as "tìm hiểu", "nghiên cứu", "so sánh", "kiểm chứng", "mới nhất", "hiện tại"). Covers choosing research depth, crafting search queries (keywords, language, operators), judging sources, citing, and deciding when to stop. Skip it only for stable knowledge you can answer confidently without looking anything up.
---

# Research

## Core principle

Use the **least research depth that answers the question reliably**, and treat your prior knowledge as a **hypothesis, not a map**.

Reasoning, search, and evidence are complementary. A polished answer is not evidence that the research was good. The most common failure is:

```text
model memory → fixed outline → confirmation searches → polished answer
```

The goal is:

```text
frame → search broadly → read the best sources → let evidence revise the frame → challenge → close gaps → answer
```

## Step 0 — Anchor (always, takes seconds)

- **Today's date.** Take it from the system context (or run `date`). Use it for every year or version qualifier in queries and for judging freshness. Never add a year from training memory to a query; that is how searches silently return outdated results.
- **Local first.** If the question is about the user's own code, system, or files, check the repo, configs, logs, installed versions, and `--help`/man pages before the web. They are the most authoritative source for "how does *my* setup behave".
- **Language.** Answer in the user's language. Choose query language by topic, not by the user's language (see `references/query-crafting.md`).

## Step 1 — Choose a mode

Read `references/modes.md` when the mode is not obvious. Summary:

| Mode | Use when | Typical effort* | Must-haves |
|---|---|---|---|
| A. Direct | stable, narrow, low-risk | 0–2 searches | verify only the facts that matter |
| B. Practical | real problem, deciding factors unknown | ~5–10 | decision factors, mechanisms, a measurement if data is missing |
| C. Decision / comparison | several viable options, consequential choice | ~10–20, options in parallel | criteria from the user's context, a primary source per option, a challenge query per option |
| D. Discovery / mastery | unfamiliar domain, roadmap, "from zero" | ~15–30, consider subagents | provisional map revised by evidence (`references/discovery.md`) |
| E. Current state | the answer could have changed | +2–5 on top of the base mode | dated sources, event date vs publication date |

\*Effort ranges are **guardrails, not quotas**. Production research agents behave best with explicit scaling rules: without them they over-research trivia and under-research decisions. Use the range to notice when you are far outside it, then ask why. Stop based on coverage (Step 4), not on the count.

If the user explicitly asks for research, verification, or the latest information, honor that depth.

## Step 2 — Write a short plan (modes B–E)

Before the first search, write a few lines in your reply or working notes:

```text
Goal: what the user needs to decide or understand
Sub-questions: 2–5; for each, what a good answer must contain (number, version, mechanism, date…)
Query families: which angles and why (terminology, mechanism, alternatives, failure modes, counter-evidence, primary source, current state)
Query language(s): English / Vietnamese / both, and why
```

Writing it forces a real decomposition instead of turning the user's wording into one query, and it makes the framing easy to correct.

## Step 3 — Search loop

Each round: **search → open the best pages → reflect**.

- Keep queries short (about 2–6 words). Start broad, then narrow. Overly long, specific queries are the most common query failure: they return few, narrow results.
- Run independent searches and fetches **in parallel** in one turn. For big modes C/D, see `references/parallel-research.md`.
- Snippets are leads, not evidence. Open the page before relying on a material claim.
- Never repeat a query; change the angle, the vocabulary, or the source target.

After each round, reflect briefly (in your notes):

```text
Learned: …
New terms / leads / contradictions: …
Still missing: …
Next queries: evidence-driven (from what I just read) and challenge (could this be wrong?)
```

Later rounds should come from the evidence, not only from your initial hypothesis. How to build good queries: `references/query-crafting.md`. Breadth, depth traversal, and conflict handling: `references/search-strategy.md`.

## Step 4 — Gap check before answering (modes B–E)

Write it down. Skipping this step is how research stops too early.

- Each sub-question: answered / partial / open, with the source that answers it.
- Material claims supported only by memory or snippets → read a source or mark them unverified.
- Go through every number, date, and version in your draft and name the opened page that states it. Figures picked up from a search snippet or a page you did not open are the most common citation error. Open the page, or label the figure as unverified.
- When sources give different dates or figures for the same event, do not pick one silently. Check the primary source, or report the disagreement.
- For a recommendation: did at least one challenge query look for evidence against it?
- For current-state facts: does each have a date or version?
- Is any open unknown able to flip the conclusion? → research it, or state it plainly.

**Stop** when remaining unknowns would not materially change the answer. Two practical signals: the last two rounds produced nothing new, or you are at roughly twice the typical effort. In both cases, stop and report the gaps rather than spiral. Source quality and claim discipline: `references/evidence.md`.

## Step 5 — Answer

- **Answer first** in the user's language: conclusion or recommendation → why → trade-offs and failure modes → uncertainty → next step or measurement. For learning questions, lead with the mental model instead (`references/reasoning-and-explanation.md`).
- **Cite inline**: every material factual claim links to a page you actually opened, e.g. `[PostgreSQL docs](https://…)`. Put a date or version next to current-state facts. End with a short source list.
- **Label** inference and recommendation when the distinction matters. Never present your inference as something a source said.
- **Say what you could not verify**: "I found no reliable source for X" is useful information, not a failure.
- Paraphrase. Keep quotes under 15 words, at most one per source.
- Research depth ≠ answer length. Keep the plan, reflections, and gap check out of the final answer unless the user wants the trail.
- Honor requested length. If the user asks for something short ("ngắn gọn", "briefly"), cut to the core answer plus one source, and offer more detail instead of including it.

## Tool honesty

Never imply a page, repository, or document was read if it was not actually opened. If the user forbids external research, stay within supplied material and reasoning, and state the limits.

## Reference files

| File | Read when |
|---|---|
| `references/modes.md` | choosing or escalating depth |
| `references/query-crafting.md` | before writing queries in any mode B–E; when results are poor |
| `references/search-strategy.md` | non-trivial web research: query families, depth traversal, conflicts |
| `references/evidence.md` | claims, comparisons, recommendations, conflicting sources |
| `references/discovery.md` | unfamiliar domain, mastery, unknown taxonomy |
| `references/reasoning-and-explanation.md` | turning findings into an explanation or recommendation |
| `references/parallel-research.md` | modes C/D with many independent sub-questions |

Do not mechanically read every file for simple questions.
