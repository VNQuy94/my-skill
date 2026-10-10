# Research Modes

## Purpose

Choose research depth adaptively. The user should not need a different prompt template for every kind of question.

## Routing questions

Assess:

1. **Freshness** — could the answer have changed?
2. **Knowledge sufficiency** — is existing reasoning likely enough?
3. **Alternatives** — are there multiple viable approaches?
4. **Context dependence** — does the answer depend on the user's system, constraints, or goals?
5. **Consequence** — is a wrong answer costly, risky, or hard to reverse?
6. **Breadth** — is the user asking for mastery or an unfamiliar domain rather than one narrow fact?

Use judgment rather than mechanically scoring.

## Effort guardrails

| Mode | Typical searches | Parallelism |
|---|---|---|
| A | 0–2 | none |
| B | ~5–10 | parallel tool calls for independent sub-questions |
| C | ~10–20 | one search set per option, run in parallel |
| D | ~15–30 | consider subagents (`parallel-research.md`) |
| E | +2–5 on top of the base mode | — |

These ranges are guardrails, not quotas. Without explicit scaling, agents tend to over-research simple questions and under-research consequential ones. Being far outside the range is a signal to reconsider the mode, not a reason to stop or continue by itself. Coverage of material questions decides when to stop.

---

## Mode A — Direct reasoning / light verification

Use when the question is stable, narrow, low-risk, and well understood.

Examples:

- explain a standard concept;
- clarify syntax;
- derive an answer from supplied facts;
- answer a stable technical question.

Behavior:

```text
reason
→ verify only material facts if needed
→ answer
```

Search when required for freshness, exact terminology, authoritative semantics, or uncertainty.

Do not over-research.

---

## Mode B — Practical investigation

Use when the user needs a solution to a real problem and the deciding factors are not yet fully known.

Examples:

- choose a cron interval;
- diagnose an integration problem;
- select a testing approach;
- improve a workflow;
- determine how to benchmark something.

Behavior:

```text
frame the problem
→ identify decision factors and missing knowledge
→ lightweight discovery if terminology is unclear
→ research multiple solution families
→ understand mechanism and failure modes
→ compare against user context
→ close material gaps
→ recommend
```

The user does not need to know the correct decomposition beforehand.

---

## Mode C — Decision / comparison research

Use when multiple credible options exist and the recommendation has meaningful consequences.

Examples:

- technology selection;
- architecture choice;
- buy-vs-build;
- migration strategy;
- operational policy.

Behavior:

```text
establish decision criteria
→ understand mechanisms of each viable option
→ research primary/strong sources
→ test trade-offs and failure modes
→ search counter-evidence and boundary conditions
→ map evidence to user constraints
→ recommend conditionally
```

Do not compare options using generic dimensions that do not affect the user's decision.

---

## Mode D — Domain discovery / mastery

Use when the user is new to a topic, asks to understand a field deeply, or cannot reasonably know what should be learned.

Behavior:

```text
broad reconnaissance
→ terminology extraction
→ provisional knowledge map
→ prerequisite/dependency discovery
→ practitioner questions / failures / controversies
→ gap-driven research
→ map revision
→ deep investigation
→ synthesis / roadmap
```

Use `discovery.md`.

The knowledge map is an output of research, not something the user must provide.

---

## Mode E — Current-state research

Use when the answer depends on what is true now:

- current releases;
- laws and regulations;
- prices;
- political/company figures;
- schedules;
- recent incidents;
- market conditions;
- fast-moving product behavior.

Behavior:

```text
establish today's date from the system context (never from memory)
→ prioritize fresh authoritative evidence
→ distinguish event date from publication date
→ cross-check consequential claims
→ answer with concrete dates/versions
```

Query in the language of the authoritative source: Vietnamese for Vietnamese law, wages, prices, and procedures; English for global software releases.

Freshness requirements can combine with any other mode.

---

## Escalation

Start at the lightest plausible mode.

Escalate when research reveals:

- unfamiliar terminology;
- disagreement between sources;
- hidden alternatives;
- high-impact failure modes;
- a decision more consequential than first assumed;
- evidence that contradicts the initial framing.

Do not downgrade merely because a quick answer is already available.

## Explicit user intent

If the user explicitly asks for research, verification, comparison, deep investigation, or current information, honor that requested depth unless external research is unavailable or forbidden.
