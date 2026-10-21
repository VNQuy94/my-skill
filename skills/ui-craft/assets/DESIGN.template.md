---
# DESIGN.md — the single source of truth for how this product looks.
# Tokens live in this YAML block; the prose below explains why they exist.
# After every edit: node <ui-craft>/scripts/tokens.mjs  (regenerates src/styles/theme.css and checks it)
name: __PRODUCT__
mode: operate            # persuade (marketing) | operate (app, tool) | read (docs, articles) | experience (portfolio, gallery)
character: [__word1__, __word2__, __word3__]   # every choice below should trace back to these
bold-move: "__the one memorable thing; everything else stays quiet__"

colors:                  # names are ROLES, never hues. Hex or oklch(L C H).
  canvas: "__"           # page background
  surface: "__"          # panels, cards, inputs
  ink: "__"              # body text and icons
  ink-muted: "__"        # secondary text (must still pass 4.5:1)
  line: "__"             # borders, dividers
  accent: "__"           # primary action, focus ring, selection, links
  on-accent: "__"        # text/icons placed on accent
  # optional status roles, each with its on- pair if text sits on it:
  # danger: "__"
  # success: "__"

# dark:                  # optional; same role names with dark values
#   canvas: "__"

# contrast:              # optional extra pairs to verify: [foreground, background, minimum]
#   - [accent, surface, 3]

fonts:                   # check Vietnamese support first: python3 <ui-craft>/scripts/fonts_vi.py --check "Family"
  display: { family: "__", fallback: "serif", variable: true }
  body: { family: "__", fallback: "system-ui, sans-serif", variable: false }
  # mono: { family: "__", fallback: "ui-monospace, monospace" }   # code and tabular data only

type:                    # named text styles → classes `type-<name>`; nothing else sets font size
  display: { font: display, size: 3.5rem, line: 1.1, weight: 600, tracking: -0.02em }
  h1: { font: display, size: 2.25rem, line: 1.15, weight: 600 }
  h2: { font: body, size: 1.5rem, line: 1.25, weight: 600 }
  h3: { font: body, size: 1.125rem, line: 1.35, weight: 600 }
  body: { font: body, size: 1rem, line: 1.6, weight: 400 }
  small: { font: body, size: 0.875rem, line: 1.5, weight: 400 }
  label: { font: body, size: 0.875rem, line: 1.3, weight: 500 }

radius: { sm: 4px, md: 8px, lg: 12px }   # rounded-sm/md/lg; rounded-full stays available for pills and avatars
# shadow: { raised: "0 1px 2px oklch(0.2 0.02 60 / 0.12)", overlay: "0 12px 32px oklch(0.2 0.02 60 / 0.18)" }
spacing: 4px             # Tailwind base unit: p-4 = 4 × 4px

motion:
  ease: "cubic-bezier(0.2, 0.8, 0.2, 1)"   # class ease-brand
  fast: 150ms            # var(--motion-fast): hover, press
  base: 240ms            # var(--motion-base): open, expand
  moment: "__the single orchestrated motion moment, or none__"

icons:
  library: lucide        # lucide | tabler | phosphor — exactly one
  stroke: 1.75           # lucide/tabler stroke width at 24px
  # weight: regular      # phosphor only: thin | light | regular | bold | fill | duotone
  cap: round             # round | square | butt  (lucide/tabler)
  join: round            # round | miter | bevel
  sizes: [16, 20, 24]
  custom-dir: src/icons/custom
---

# __PRODUCT__ design

## Direction

Who uses it, where, under what light, and what they need to do first. The subject's world (materials, objects, vocabulary, era) that the choices below borrow from.

## Why these tokens

- **Color:** what each role is for; what the accent is reserved for.
- **Type:** why these faces; what carries the personality.
- **Shape and elevation:** border or shadow (not both), and why this radius.
- **Icons:** why this library and stroke; the concept → icon map lives in `src/icons/registry.ts`.

## Do / Don't

- Do: …
- Don't: …

## Decision log

Newest first. Record what was tried and rejected so later work does not drift back to it.

- YYYY-MM-DD: …
