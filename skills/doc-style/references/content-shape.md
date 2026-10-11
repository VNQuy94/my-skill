# Content shape → form

Decide the form of each section **before** writing it. A document turns into a wall of text when every idea is written as a paragraph by default. It turns into visual noise when every idea gets a box, a color, or bold. The right form follows the shape of the content.

## Decision table

| If the content is… | Use | Not |
|---|---|---|
| several items compared on several attributes | **table** (`data-table` / `t.table`) | paragraphs that repeat "A has…, B has…" |
| exact values the reader will look up or quote | **table** | a chart, where values must be estimated by eye |
| a trend, distribution, or relationship over many values | **chart** (`chart_theme.py`) | a table of 30 numbers |
| an ordered procedure | **numbered list** | bullets, or a paragraph with "then… then…" |
| 3–7 parallel points of equal weight | **bullets** (≤ 2 levels) | one long paragraph |
| the 1–3 numbers that matter most | **stat** (key figure) | burying them in a sentence |
| the conclusion or "what to do" for a busy reader | **summary callout** at the top | a summary only at the end |
| a definition, caveat, risk, or example set apart from the flow | **callout** of the matching kind | colored text inside a paragraph |
| reasoning, context, a narrative, an argument | **short paragraphs** (3–5 sentences) | bullets that chop an argument into fragments |
| a process with branches or a system with parts | **diagram** (image figure) | a paragraph describing boxes and arrows |
| code, commands, config | **code block** | a paragraph in body font |

Sources for the table/chart and summary rules: UK Analysis Function guidance on tables (tables for exact values, charts for patterns), NN/g long-form formatting research (summaries up front, short bullets, callouts for stats and definitions, informational visuals only).

## Rhythm rules

- **Open with the point.** Reports, proposals, and analyses start with a summary callout of 2–4 sentences or bullets.
- **Break long runs of prose.** If more than ~5 body paragraphs follow each other, check whether one of them is really a list, a comparison, or a key number. Leave them as prose only if they are an argument that must flow.
- **One idea per paragraph**, 3–5 sentences. A paragraph over ~150 words usually holds two ideas.
- **Bold sparingly**: key terms or the lead words of long bullets, under ~30% of the text. Never bold a whole paragraph for emphasis; use a callout.
- **No decorative visuals.** Every figure must carry information the text does not already give more simply.
- **Do not over-correct.** Not every section needs a visual. A legal notice or a narrative memo can be mostly prose; the rule is that prose must be a choice, not a default.

## Layout plan (write it before the document)

For any document longer than about one page, write a plan like this first:

```text
Audience / purpose: …
Profile: modern | formal | nd30
1. Summary            → callout (summary)
2. Context            → 2 short paragraphs + chart (orders per month)
3. Options            → table (3 options × cost, time, risk), numeric cols right-aligned
4. Recommendation     → stat row (3 key figures) + paragraph
5. Next steps         → numbered list
6. Risks              → warning callout
```

Then write the content into that plan.
