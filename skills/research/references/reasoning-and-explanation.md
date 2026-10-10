# Reasoning and Explanation

## Purpose

Turn research into an answer that is useful for the user's actual goal, not merely a summary of sources.

## 1. Reason from mechanisms, not slogans

When evaluating a concept or solution, prefer:

```text
problem
→ mechanism
→ guarantee
→ non-guarantee
→ failure mode
→ alternative
→ trade-off
→ fit for context
```

Not every answer needs all eight elements, but important recommendations usually need most of them.

Do not use labels such as "best practice", "scalable", "enterprise-grade", or "modern" as substitutes for mechanism.

## 2. Separate universal facts from contextual judgment

Use this mental structure:

```text
Source facts
      +
User/project context
      ↓
Inference
      ↓
Conditional recommendation
```

Example form:

- **Fact:** authoritative documentation guarantees X under conditions Y.
- **Inference:** because the user's workload has Z, Y is likely to hold / not hold.
- **Recommendation:** choose A if constraint C matters more than D.

Do not imply that a source made the contextual recommendation unless it did.

## 3. Explain at the user's level

For a novice:

- define terms before relying on them;
- prefer concrete examples before abstraction;
- expose prerequisites when a concept depends on them;
- avoid stacking unexplained jargon.

For an experienced practitioner:

- compress basics;
- focus on mechanism, edge cases, trade-offs, and implementation consequences.

Depth should follow the requested capability, not the amount of material found.

## 4. For problem solving

Do not jump from symptom to tool.

Prefer:

```text
symptom
→ possible mechanisms
→ evidence needed to distinguish them
→ viable solution families
→ constraints / failure modes
→ recommendation or experiment
```

If evidence cannot distinguish hypotheses, propose the smallest useful measurement or test instead of pretending certainty.

## 5. For comparisons

Choose dimensions from the user's decision, not from a generic comparison template.

Good dimensions answer:

- What changes the decision?
- What differs in mechanism?
- What failure or operational cost matters?
- What is hard to reverse?

Avoid irrelevant feature-count comparisons.

## 6. For learning/mastery

A useful learning structure is dependency-based:

```text
prerequisites
→ core concepts
→ mechanisms
→ failures
→ trade-offs
→ advanced patterns
→ applied case
```

The roadmap is a pedagogical synthesis unless a source explicitly prescribes it. Present it as a recommendation, not as sourced fact.

## 7. Uncertainty language

Use uncertainty precisely:

- **high confidence** — strong direct evidence, scope matches;
- **moderate confidence** — evidence supports the conclusion but context or independence is imperfect;
- **low confidence** — important assumptions or evidence gaps remain.

Do not add uncertainty boilerplate to every sentence. Surface it where it can change action.

## 8. Answer-first synthesis

For practical work questions, lead with:

1. conclusion or current best recommendation;
2. why;
3. important trade-offs or failure modes;
4. evidence and uncertainty;
5. next measurement/action when needed.

For learning questions, lead with the mental model and dependency structure instead.

## 9. Do not confuse research completeness with answer length

Research may be deep while the final answer remains concise.

Include only evidence and detail that help the user's goal. Keep the research process mostly internal unless the user asks to audit it.
