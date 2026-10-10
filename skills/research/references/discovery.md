# Discovery

## Purpose

Use discovery to learn the structure of an unfamiliar domain or problem space before treating any outline as complete.

The model's prior knowledge is a **starting hypothesis**, not the authoritative taxonomy. Evidence is allowed to add, remove, split, merge, or reorder branches.

## When to run

Run discovery when one or more are true:

- the user is unfamiliar with the topic;
- the task asks for broad understanding, mastery, a roadmap, or a knowledge map;
- the problem uses unfamiliar or ambiguous terminology;
- the correct decision criteria are not yet known;
- early search results reveal important concepts not present in the initial framing.

For narrow, well-framed questions, keep discovery lightweight.

## Discovery workflow

### 1. Frame the target capability

Capture only what is needed:

- topic or problem;
- user's current level, if known;
- desired capability or decision;
- material constraints.

Do not require the user to provide the taxonomy.

### 2. Run broad reconnaissance before finalizing a map

Use several distinct discovery angles as appropriate:

- definitions and canonical terminology;
- foundational concepts and prerequisites;
- practitioner/design questions;
- common failures, pitfalls, and operational concerns;
- alternatives, controversies, and boundary cases;
- advanced topics and neighboring concepts.

The purpose of this pass is **terminology and structure discovery**, not final explanation.

### 3. Extract evidence-derived concepts

From retrieved sources, record:

- recurring terms;
- parent/child concepts;
- prerequisites and dependencies;
- problems and mechanisms that address them;
- alternatives and commonly confused concepts;
- unresolved questions;
- source references that justify relationships.

Do not promote a concept to "core" only because the model already knew it.

### 4. Build a provisional map

The first map is `provisional`, not `stable`.

Useful relationships include:

- `A requires B`
- `C is an alternative to D`
- `E solves problem F`
- `G is often confused with H`
- `I is operational rather than foundational`

Useful states include:

- `discovered`
- `partially-evidenced`
- `unexplored`
- `contested`
- `stable-enough`

### 5. Search for missing structure

Ask:

- Which important practitioner questions have no branch?
- Which failure modes are not represented?
- Which authoritative sources organize the domain differently?
- Which newly discovered terms imply a missing dependency or neighboring topic?
- Which branch exists only because of model memory and lacks evidence?

Use those gaps to generate the next search round.

### 6. Stability check

A map is stable enough to drive deeper research only when:

- new discovery queries mostly refine existing branches rather than reveal material new top-level branches;
- critical branches have support from sources appropriate to the domain;
- structural contradictions are understood or explicitly retained as unresolved;
- remaining unknowns are unlikely to change the learning path or decision materially.

Do not claim completeness. Prefer **stable enough for the current goal**.

## Anti-anchoring rule

Avoid:

```text
model memory
→ fixed outline
→ search for confirmation
→ teach
```

Prefer:

```text
initial hypothesis
→ broad evidence discovery
→ provisional map
→ gap-driven search
→ evidence changes the map
→ deeper investigation
```

## Lightweight discovery for practical problems

For ordinary work problems, discovery may produce only:

- decision factors;
- missing terminology;
- plausible mechanisms;
- solution families;
- material risks or failure modes.

Then continue to targeted research.

## Required principle

**Evidence may change the decomposition.**

If retrieved evidence reveals that the original framing is incomplete or wrong, update the research structure instead of forcing the evidence into the initial outline.
