# Icon system

A distinctive icon set does not mean drawing 200 icons. No published evidence shows models can draw a whole consistent set (SVG benchmarks score icons one at a time), and hand-drawn sets drift. The system has three tiers, all rendered through one component.

## Tier 1: one library

| Library | Character | Notes |
|---|---|---|
| Lucide (`lucide-react`) | neutral, clean, rounded | 24px grid, stroke-based; the shadcn default, so it reads "standard" unless the signature changes it |
| Tabler (`@tabler/icons-react`) | the widest coverage, slightly technical | 24px grid, stroke-based, 2px stroke by default; good for dense apps |
| Phosphor (`@phosphor-icons/react`) | friendlier, softer, six weights | drawn as filled shapes on a 256 grid; choose a **weight** (thin/light/regular/bold/fill/duotone), not a stroke |

Exactly one. `lint_ui.mjs` fails on a second icon package or on icon imports outside `src/icons/`.

## Tier 2: the signature

Set in DESIGN.md `icons:` and applied by `<Icon>` everywhere:

- **stroke** (Lucide/Tabler): 1.25–2 at 24px. Match the type: a light, high-contrast serif wants 1.25–1.5; a sturdy grotesque 1.75–2. `<Icon>` keeps the visible stroke constant at every size.
- **cap / join:** round (friendly, the library default) or square/miter (precise, technical, editorial).
- **weight** (Phosphor): measured stroke equivalents at 24px are thin 0.75, light 1.125, regular 1.5, bold 2.25.
- **sizes:** three steps, usually 16/20/24. Pair 16 with 14–16px text, 20 with 16–18px, 24 for standalone controls.
- **color:** icons inherit `currentColor`; color them through the text role, accent only when the icon itself is the action.

Changing the signature in DESIGN.md and re-running `tokens.mjs` restyles every icon in the app.

## Tier 3: the product's own icons

Draw only the 3–8 concepts that belong to the product and that the library lacks or depicts wrongly. Procedure:

1. Open `assets/icons/icon-grid.svg`: 24×24, live area 1–23, keylines circle Ø20, square 18, portrait 16×20, landscape 20×16. Fit each object to the keyline closest to its shape so round and square icons look the same size.
2. Draw with `<path>`, `<circle>`, `<line>`, `<rect>`, `<polyline>` only: no fills, colors, transforms, text, or masks. Keep ≥ 2px between separate strokes, whole or half-pixel coordinates, the same corner radius as the library (2px for Lucide/Tabler rectangles).
3. Use the library's metaphors: if the library draws a document with a folded corner, so do yours.
4. Wrap with `customIcon('name', <>…</>)` in `src/icons/custom/<name>.tsx` and register it.
5. `lint_icons.mjs` checks the rules; `specimen.mjs` draws custom icons in accent next to the library at all sizes. Look: if a custom icon looks heavier, lighter, smaller, or busier than its neighbours, fix it before use.

## Registry rules

- `src/icons/registry.tsx` maps **concepts** to pictures: `delete`, not `trash`. One picture per concept, one concept per picture (`lint_icons.mjs` warns on reuse).
- Components only use `<Icon name="…" size="sm|md|lg" />`.
- Decorative icons next to visible text get no label (`aria-hidden`); icon-only buttons need `label="…"` (or the button's own `aria-label`).
- Never emoji or Unicode symbols as icons.
