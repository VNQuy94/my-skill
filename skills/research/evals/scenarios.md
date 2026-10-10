# Validation Scenarios

Use these scenarios after editing the skill (moved here from the skill root so agents do not load it during normal use). The purpose is to detect regression in research behavior, not to enforce identical wording.

## Baseline failure this version is designed to prevent

Observed failure pattern:

```text
model already knows a domain
→ creates a polished taxonomy
→ searches for sources matching that taxonomy
→ declares coverage stable
→ teaches from the original map
```

Expected behavior after this skill:

```text
initial map treated as provisional
→ broad discovery
→ terminology/evidence changes or confirms structure
→ later queries use retrieved leads
→ important sources are traversed for mechanism/limits
→ gaps and counter-evidence are checked
→ synthesis happens after material unknowns close
```

---

## Scenario 1 — Stable narrow concept

User:

> Explain PostgreSQL advisory locks and `pg_try_advisory_lock`.

Pass criteria:

- does not perform a full domain-discovery workflow;
- explains the concept directly;
- verifies authoritative semantics if needed;
- does not inflate the answer with unrelated distributed-lock theory.

Failure:

- runs many broad searches despite low uncertainty.

---

## Scenario 2 — Practical work problem

User:

> A reconciliation cron should run every how many minutes? I want a number suitable for my production system.

Pass criteria:

- rejects the idea of a universal number unless evidence supports one;
- decomposes decision factors such as acceptable inconsistency window, workload, query cost, recovery objective, and backlog;
- researches mechanisms or benchmarking approaches as needed;
- recommends measurement/experiment when project data is required.

Failure:

- searches "best cron interval" and returns a generic number.

---

## Scenario 3 — Important comparison

User:

> Should my backend use Kafka or RabbitMQ as the event backbone?

Pass criteria:

- asks/infers relevant decision context from available information;
- compares mechanisms, not feature counts;
- uses authoritative semantics;
- investigates failure/operational trade-offs;
- searches counter-evidence and boundary cases;
- makes a conditional recommendation.

Failure:

- repeats "Kafka for high throughput, RabbitMQ for low latency" without scope or evidence.

---

## Scenario 4 — Unfamiliar-domain mastery

User:

> I have only heard the term "zero trust architecture". Research it from zero until I can design and review a production architecture.

Pass criteria:

- performs domain discovery before declaring the knowledge map;
- extracts recurring terminology and prerequisites from sources;
- treats the first map as provisional;
- searches practitioner questions, failures, controversies, and adjacent concepts;
- lets later evidence add/remove/reorder branches;
- distinguishes sourced domain facts from the model's learning roadmap.

Failure:

- creates the full curriculum from memory, then searches only to support it.

---

## Scenario 5 — Evidence conflict

User:

> Sources disagree on whether solution X is faster than solution Y. Which is correct?

Pass criteria:

- identifies the exact conflicting performance claim;
- compares benchmark workload, versions, methodology, environment, and source incentives;
- traces shared upstream data when relevant;
- does not majority-vote;
- may conclude "context-dependent" or "unresolved" if evidence requires it.

Failure:

- chooses whichever claim appears in more search results.

---

## Scenario 6 — Evidence-driven query evolution

In any non-trivial research task, inspect the research trace.

Pass criteria:

- at least some later searches are caused by terms, references, contradictions, or gaps found in earlier sources;
- high-value authoritative pages are followed to detailed subpages/specifications when needed;
- the decomposition changes when evidence reveals a material missing concept.

Failure:

- all queries are pre-generated from the initial model outline.

---

## Scenario 7 — Stop rule

Pass criteria:

- stops when remaining unknowns are immaterial to the user's goal;
- continues when one unresolved unknown could reverse the recommendation.

Failure:

- stops because "five sources were found";
- continues indefinitely merely to collect more sources.

---

## Scenario 8 — Query language and keywords

User (in Vietnamese):

> Cron đối soát đơn hàng với cổng thanh toán nên chạy mấy phút?

Pass criteria:

- translates the user's term to the canonical English term ("reconciliation") for technical queries;
- uses Vietnamese queries for Vietnam-specific facts (law, wages, local providers' policies);
- queries are short; later queries use vocabulary found in earlier sources;
- year/version qualifiers come from today's date, not training memory.

Failure:

- searches the user's full sentence in Vietnamese and stops at the first page of results;
- adds a stale year (e.g. last year's) to "latest" queries.

---

## Scenario 9 — Citations and gap check

Pass criteria:

- every material factual claim in the final answer links to a page that was actually opened;
- current-state facts carry a date or version;
- a written gap check happened before the answer in modes B–E;
- unverifiable claims are labeled as such.

Failure:

- answer cites a page only seen as a search snippet;
- answer contains specific numbers with no source and no "unverified" label.

---

Runnable versions of several scenarios live in `evals.json` (skill-creator format).
