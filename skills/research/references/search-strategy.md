# Search Strategy

## Purpose

Search is not a single query. It is an adaptive process combining breadth, depth, and evidence-driven query evolution.

## 1. Start with query families

Choose multiple angles appropriate to the task:

- **terminology** — canonical names, synonyms, neighboring terms;
- **mechanism** — how and why something works;
- **solution** — candidate approaches or patterns;
- **alternatives** — different mechanisms for the same problem;
- **failure modes** — where an approach breaks;
- **counter-evidence** — evidence against the current hypothesis;
- **boundary conditions** — when a claim stops applying;
- **source-specific** — official docs, standards, papers, code, postmortems, domain authorities;
- **current-state** — version, law, release, price, schedule, incident, or other time-sensitive facts.

Do not mechanically run every family. Use enough diversity to reduce anchoring and terminology miss.

How to phrase each query (length, language, operators, templates, worked examples): `query-crafting.md`.

## 2. Search horizontally, then traverse vertically

### Horizontal search

Search across query families to discover:

- terminology;
- competing explanations;
- strong sources;
- unexpected concepts;
- disagreement.

### Vertical traversal

When a high-value source contains an important mechanism, guarantee, limitation, or reference, follow relevant linked pages, specifications, subpages, or cited material.

Good depth triggers:

- an authoritative overview links to the detailed mechanism/specification;
- a claim is important but the current page explains only *what*, not *how/why*;
- a guarantee has scope or exceptions that remain unclear;
- a source cites original research or a standard;
- a newly discovered concept is necessary to understand the claim.

Continue until the material question is resolved or deeper traversal is unlikely to change the conclusion.

Do not crawl a site merely because links exist.

## 3. Generate later queries from retrieved evidence

After each meaningful search/read round, mine the evidence for:

- new terminology;
- references and cited works;
- mechanisms;
- contradictions;
- boundary conditions;
- unanswered questions;
- named alternatives;
- error modes or operational symptoms.

Use those leads to form the next queries.

Later rounds should not be only variations of the model's initial hypothesis.

```text
initial query
→ source introduces X
→ search mechanism and limitations of X
→ source reveals failure Y
→ search Y + alternatives / mitigation
```

## 4. Track query provenance conceptually

Distinguish:

- **hypothesis-driven query** — derived from prior reasoning;
- **evidence-driven query** — derived from retrieved evidence;
- **challenge query** — designed to falsify or bound a hypothesis.

For non-trivial research, later rounds should contain evidence-driven and challenge queries, not only hypothesis-driven ones.

## 5. Match source type to the question

Typical preferences:

- semantics, guarantees, APIs, protocols → official docs, standards, original specifications;
- empirical claims → original papers, benchmarks, datasets;
- real production failures → postmortems, issue trackers, practitioner reports;
- community experience → forums/Reddit/Stack Overflow as leads or practical evidence, not automatic authority;
- product/company claims → primary product docs plus independent evidence for evaluative claims.

Authority is question-dependent. A vendor can be the best source for API semantics and a weak source for "we outperform every alternative."

## 6. Resolve conflicts explicitly

When sources disagree, investigate:

- version/date differences;
- scope and definitions;
- methodology;
- workload or environment;
- incentives and source type;
- whether sources are truly independent.

Do not majority-vote.

## 7. Search snippets are discovery aids

Do not treat a search-result snippet as support for a material claim when the underlying source can be read.

## 8. Search breadth is not source count

Ten sources repeating one upstream claim do not provide ten independent pieces of evidence.

Prioritize coverage of material questions over accumulation of URLs.

## 9. Depth and stopping

Continue searching when an unresolved unknown could materially change:

- the explanation;
- the recommended solution;
- the comparison;
- the risk assessment;
- the knowledge map.

Stop when additional search is producing only low-value refinements and material unknowns are resolved or explicitly bounded.

Practical signals that you have reached that point:

- the last two rounds returned sources you had already seen, or nothing new;
- you are at roughly twice the typical effort for the mode (see `modes.md`).

In either case, stop and report remaining gaps explicitly instead of continuing to collect sources.
