# Evidence

## Purpose

Make research conclusions auditable. Keep source facts separate from inference, recommendation, and uncertainty.

## Evidence types

For important conclusions, distinguish:

- **Source fact** — directly supported by a source.
- **Inference** — reasoning that combines facts, context, or mechanisms.
- **Recommendation** — a choice based on goals and trade-offs.
- **Uncertainty** — unresolved or context-dependent information.

Never present an inference or recommendation as if a source stated it.

## Evidence ledger

For material claims, maintain enough internal state to answer:

```yaml
claim:
support:
  - source
  - exact point supported
source_type:
freshness:
independence:
counter_evidence:
scope_or_boundary:
confidence:
status:
```

Possible `status` values:

- `supported`
- `partially-supported`
- `contested`
- `insufficient`
- `inference`
- `recommendation`

For modes C and E, write a compact version of the ledger in your working notes, one line per material claim, e.g.:

```text
Redis AOF with fsync=everysec can lose ~1s of writes | Redis persistence docs (read) | primary | 2026-03 | supported
```

A ledger that is only "kept in mind" tends not to exist. It does not need to appear in the final answer unless the user asks to audit the research.

## Claim-to-source discipline

A citation must support the specific claim attached to it, not merely discuss the same topic.

Avoid:

- citing an overview for a detailed guarantee it does not state;
- citing a secondary article when the original specification is available and material;
- citing several pages that repeat the same upstream source as if they were independent confirmations.

## Source quality is contextual

Evaluate sources by:

- authority for this exact question;
- directness of evidence;
- freshness when time matters;
- methodology or reproducibility;
- independence;
- incentives/conflicts;
- scope match.

Do not reduce source quality to one universal hierarchy.

## Red flags in a source

Treat a claim with caution, and look for a better source, when it shows:

- speculation presented as fact: "could", "may", "is expected to", future-tense narratives, projections;
- an aggregator or rewrite instead of the original source;
- passive voice with nameless sources ("it is reported that…");
- general qualifiers without specifics ("significantly faster", "widely adopted");
- marketing language, or a vendor judging itself against competitors;
- cherry-picked numbers without workload, version, or methodology;
- SEO content-farm structure (generic listicles, no author, no date).

Research agents tend to prefer SEO-optimized pages over authoritative but less polished ones (specs, papers, personal engineering blogs, issue threads). Correct for that deliberately.

## Absence of evidence is a finding

If you searched properly and found no reliable source for a claim, say so: "I found no reliable source for X". Report it instead of filling the gap with plausible prose.

## Critical-claim standard

Increase evidence strength with importance.

Examples:

- stable API/protocol semantics may be adequately supported by the authoritative specification;
- empirical performance claims usually need original measurements and context;
- high-impact recommendations should consider multiple viable options and counter-evidence;
- contested claims should preserve disagreement when it cannot be resolved.

Do not invent a fixed source-count rule.

## Counter-evidence and boundary cases

For important recommendations or broad claims, ask:

- What evidence would make this wrong?
- Under what conditions does it fail?
- Who recommends a different approach, and why?
- Is the claim universal or workload/context dependent?

If counter-evidence changes the conclusion, update the conclusion.

## Evidence independence

Multiple sources are not independent if they:

- quote the same original source;
- reproduce the same vendor benchmark;
- syndicate the same article;
- derive from the same dataset without independent analysis.

Trace important claims upstream when practical.

## Contradiction handling

When evidence conflicts:

1. identify the exact conflicting claim;
2. compare definitions, scope, date/version, and methodology;
3. inspect original/primary sources where possible;
4. determine whether the conflict is real, contextual, or unresolved;
5. state remaining uncertainty if it cannot be resolved.

Do not hide disagreement by averaging it away.

## Evidence for knowledge maps

A branch in a knowledge map is stronger when supported by:

- recurring appearance across strong sources;
- explicit dependency in a canonical source;
- repeated practitioner relevance;
- a material failure mode or decision consequence.

Model memory alone is not evidence that a branch is complete or central.

## Stopping criterion

Research is sufficient when:

- material claims have evidence appropriate to their importance;
- major alternatives have been considered where a decision is required;
- important counter-evidence or boundary conditions have been checked;
- contradictions that could change the conclusion are resolved or exposed;
- remaining unknowns are unlikely to change the current conclusion materially.

"Enough evidence" is proportional to decision impact, not search count.

## Final synthesis rule

In the final answer:

- state source-backed facts as facts;
- label reasoning as inference when the distinction matters;
- make recommendations conditional on user context;
- surface material uncertainty instead of filling gaps with confident prose;
- link each material claim inline to a source you actually opened, and add a date or version to current-state facts.
