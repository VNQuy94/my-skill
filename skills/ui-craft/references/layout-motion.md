# Layout, space, shape, motion

## Layout concept first

Before boxes, name the layout concept in one sentence, taken from the subject: a ledger, a timetable, a catalog, a map with a side list, a single long letter, a control panel, a board of columns. Sketch it as an ASCII wireframe for desktop and for a 390px phone. The concept decides alignment (left-aligned is the strong default for reading; centered only for short, symmetric content), the grid, and what scrolls.

## Space

- Base unit 4px (`spacing: 4px` → `p-4` = 16px). Use the scale; arbitrary `p-[13px]` values are flagged.
- **Proximity:** tight inside a group (4–12px), generous between groups (32–96px). Uniform spacing everywhere flattens hierarchy.
- More space above a heading than below it.
- Vary section weight: not every band the same height and padding.
- Content width: prose ~65ch; app content to the grid; full-bleed only for images or a deliberate band.

## Grouping without boxes

Group with space, alignment, a rule, or a heading before reaching for a card. A card is right when the thing is an object: selectable, movable, openable, or one of a set the user compares. Never nest cards.

## Shape and elevation

- 2–3 radii with hierarchy (e.g. small for inputs and chips, medium for buttons and panels). Nested corners: inner radius = outer radius − padding.
- `rounded-full` for pills, avatars, and toggles only.
- Elevation is declared once in DESIGN.md: **either** borders (`line`) **or** shadows (`shadow` tokens), not both on the same element. Default shadows are removed from the theme.
- Overlays (menus, dialogs) get the strongest elevation; keep it rare.

## Responsive

- Design the 390px layout deliberately; it is not the desktop squeezed. Reorder, collapse, or drop secondary content.
- No horizontal page scroll at any width (`shoot.mjs` fails on it). Tables scroll inside their own container.
- Touch targets ≥ 24×24px (44×44 for primary mobile actions).

## Motion

- **One authored moment** per surface at most (a page-load sequence, a reveal, a signature transition). Everything else is feedback.
- Feedback motion answers an action and shows what changed: open, expand, confirm, reorder.
- Durations: `--motion-fast` (≈150ms) for hover/press, `--motion-base` (≈240ms) for open/expand; exponential ease-out (`ease-brand`). Exits faster than entrances.
- Animate `transform` and `opacity`; never `transition-all`. Name the properties: `transition-colors`, `transition-transform`.
- Content must be visible without the animation: start from the visible state or make sure it runs; `shoot.mjs` warns when text is still invisible after scrolling.
- Respect reduced motion: the generated theme shortens animations under `prefers-reduced-motion`; use `motion-safe:` for anything large.
- Use the Motion library (`motion/react`) only for layout or gesture animation CSS cannot do.
