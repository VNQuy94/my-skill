# Color

Every color is a **role** with one job. Hue names (`blue`, `purple-500`) never appear in code; `tokens.mjs` removes Tailwind's palette so they cannot.

## Roles

| Role | Job | shadcn/ui name (also accepted) |
|---|---|---|
| canvas | page background | background |
| surface | panels, inputs, raised areas | card |
| ink | body text, icons | foreground |
| ink-muted | secondary text (still ≥ 4.5:1) | muted-foreground |
| line | borders, dividers | border |
| accent | primary action, focus ring, selection, links, current item | primary |
| on-accent | text and icons on accent | primary-foreground |
| danger / success / warning (optional) | status only, each with `on-…` if text sits on it | destructive |

Add a role only when it has a job no existing role covers, and record it in the decision log. Two chromatic colors besides status (accent plus one secondary) is the usual ceiling; `tokens.mjs` warns beyond that and when two roles are near-identical.

## Building the palette in OKLCH

Write colors as `oklch(L C H)`: lightness, chroma, and hue are independent, so steps are predictable.

1. **Temperature from the subject.** Pick a hue for neutrals from the direction's materials (paper, stone, steel, wood, sea). Tint neutrals slightly (C 0.005–0.02) toward that hue, or keep them pure gray if the direction is clinical. Decide deliberately.
2. **Canvas and surface:** close in lightness (ΔL 0.01–0.04). Contrast between them comes from line or shadow, not from a big jump.
3. **Ink:** L 0.2–0.3 on light canvases. Pure black is rarely needed; very dark tinted ink reads warmer or cooler.
4. **Accent:** one hue with a reason. Check `accent` on `canvas` ≥ 3:1 (it marks controls) and `on-accent` on `accent` ≥ 4.5:1.
5. **Status colors:** fit them to the palette's chroma and lightness so they do not shout; danger must still read as danger.

## Dark mode

Not an inversion. Add a `dark:` block in DESIGN.md with the same role names:

- Canvas L 0.15–0.22, surfaces slightly lighter than canvas (elevation = lighter).
- Ink L 0.9–0.95, never pure white on pure black for long reading.
- Lower the accent's chroma a little and raise its lightness until `on-accent` passes.
- Shadows barely show on dark; use line or lighter surfaces for elevation.

The generated CSS switches roles by `prefers-color-scheme` and by `data-theme="dark|light"` on `<html>`, so components need no `dark:` classes.

## Contrast floor

- Text: 4.5:1; large text (≥ 24px, or ≥ 18.66px bold): 3:1.
- UI boundaries that identify a control (input borders, focus ring): 3:1 against adjacent colors.
- `tokens.mjs` checks the declared pairs; `shoot.mjs` checks the rendered page, including opacity and nested backgrounds.

## Charts

Data colors are a separate system (categorical, sequential, diverging). Use the `dataviz` skill when it is available, and draw chart colors from the palette's temperature so charts belong to the product.
