# Building a design direction

Generic output is not caused by a wrong color. It is the statistical average of every similar page, reached when no decision was made. A direction is the set of decisions that every token, layout, and icon traces back to. Removing tells does not create one: swap purple for teal without a reason and you get a new default.

## 1. Classify the surface

The surface being built, not the product, decides how much boldness is allowed.

| Mode | Surface | Where boldness goes | Density | Motion |
|---|---|---|---|---|
| persuade | landing, campaign, pricing | one striking move: type as image, an unexpected layout, a subject-specific device | low | one orchestrated page-load or reveal |
| operate | app screens, dashboards, tools, settings | almost nowhere; identity lives in type, color temperature, icon signature, and small details | high | only feedback to actions (open, confirm, move) |
| read | docs, articles, help center | typography and measure; quiet chrome | medium | none |
| experience | portfolio, gallery, event | the artifact leads; frame it | varies | can carry the identity |

A product usually has several surfaces. Its landing page can be bold while its app stays disciplined; both share tokens.

## 2. Inventory the subject's world

Distinctive choices come from the subject, not from a style list. Before any token, write short answers:

- **Who** uses it, **where** (desk, phone in a hurry, outdoors, a shared screen), under what **light**, and what they must do **first**.
- **Materials and objects** of the domain: paper, metal, fabric, signage, instruments, packaging, documents, tickets, maps.
- **Vocabulary**: the words insiders use. They become labels, section names, and microcopy.
- **Era and print tradition**: is the domain tied to a period, a printing or signage style, a regional craft?
- **Rhythm**: is the work fast or slow, scheduled or continuous? That sets density and motion.

For Vietnamese subjects, local vernacular (hand-painted signage, stamps and forms, ceramics glazes, schoolbook typography, transit tickets…) is rich material, but only when the subject actually belongs to it. A national-symbol pastiche on an unrelated product is another default.

## 3. Propose 2–3 directions

Each direction is a short card:

```text
Direction B — "timetable"
Character: exact, calm, legible
Bold move: the page is a departures board; sections are rows with times in a monospaced numeral column
Color: canvas warm paper, ink blue-black, one signal accent for "now"; 5 roles total
Type: <display face> for headings (condensed, high x-height), <text face> for body; tabular numerals everywhere
Layout: left-aligned, 12-col, strong horizontal rules, no cards
Icons: tabler, stroke 1.5, square caps — matches the rule weight
Wireframe:
  ┌──────────────────────────────────────┐
  │ LOGO                      nav  nav   │
  │ 08:40  Headline set as a row  ─────→ │
  │ 09:15  Second row                    │
  │ ──────────────────────────────────── │
  │ [primary action]  secondary link     │
  └──────────────────────────────────────┘
```

The directions should differ in kind, not in hue: different structure, type, and bold move.

## 4. Review against defaults before showing them

For each direction ask:

1. **Swap test:** replace the product name with a competitor's. If the direction still fits perfectly, it is not about this subject. Revise.
2. **Default test:** compare with `defaults-2026-10.md`. Any item that matches a default must be justified by the brief, or replaced.
3. **First-idea test:** the first font, color, and layout that came to mind are the most probable ones. Keep them only if they survive the two tests above.
4. **One bold move:** exactly one thing should be memorable. If there are three, keep the strongest and quiet the rest.
5. **Subject presence:** name at least one element that could only belong to this subject (an object from the inventory turned into a component, an illustration in the palette, a photo treatment). A bold type treatment of the name alone is not enough; in tests it read as "a poster for any small shop".

Write down what you changed and why. It goes into the decision log.

## 5. Get approval, then write DESIGN.md

Show the cards (and the specimen once tokens exist). The user's own words always win: if they named a look, palette, font, or reference, follow it exactly, even when it is on the defaults list.

## Restyling an existing product

- Inventory what exists first: colors in use (`grep -rhoE '#[0-9a-fA-F]{3,6}|oklch\([^)]*\)' src | sort | uniq -c | sort -rn`), fonts, radii, icon packages.
- Keep brand equity (logo color, known typeface) unless the user asks for a redesign.
- Change style only: layout and information architecture stay unless asked.
- Route every change through tokens; then restyle shared components; then screens.

## Adding to a product that has DESIGN.md

No new direction. Read DESIGN.md and the existing screens, then list the patterns they already use before writing code:

```text
Lists: cards with a thumbnail left, name + meta, a kebab menu right; 16px gap, no rules
Filters/toggles: a segmented control already used on Settings → reuse it
Status: filled pill badges (Badge), danger/success roles only
Buttons: Button primary/secondary/ghost
Icons in use: bell → notifications, star → favourite
```
Build the new screen from that list. A new control type (tabs, a table header row, cards, a new icon meaning) needs a reason no existing pattern covers; add it to DESIGN.md first with a decision-log line. Do not give an existing icon a second meaning: register a new concept instead. New needs (a status color, an icon) also go into DESIGN.md first.
