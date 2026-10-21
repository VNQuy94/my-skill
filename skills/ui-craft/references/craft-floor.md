# Quality floor

Reach this floor silently; it is not the design, only the minimum under it. Most items are checked by the scripts (marked).

## Readability

- [ ] Text contrast ≥ 4.5:1, large text ≥ 3:1, including muted and placeholder text — `tokens.mjs`, `shoot.mjs`
- [ ] Body ≥ 16px on screens; nothing below 12px — `tokens.mjs`, `shoot.mjs`
- [ ] Body line height ≥ 1.5; no Vietnamese text below ~1.1 — `tokens.mjs`, `shoot.mjs`
- [ ] Prose measure 60–75 characters
- [ ] Every DESIGN.md font loads, with Vietnamese glyphs — `shoot.mjs`

## Structure

- [ ] One `h1` per page; headings in order without skipped levels
- [ ] Hierarchy visible in a squint: one clear first thing per screen
- [ ] More space above headings than below
- [ ] No horizontal scroll at 390px — `shoot.mjs`

## Interaction

- [ ] Visible keyboard focus on every control (theme ring, never `outline-none` without a replacement)
- [ ] Targets ≥ 24×24px — `shoot.mjs`
- [ ] Hover only on interactive elements; states covered (see `react-tailwind.md`)
- [ ] Reduced motion respected; no content stuck invisible — `shoot.mjs`
- [ ] Forms: labels, `autocomplete`, errors next to fields, paste never blocked

## System

- [ ] Only token classes: no raw colors, sizes, radii, or fonts — `lint_ui.mjs`
- [ ] One icon library, all icons through `<Icon>` — `lint_ui.mjs`, `lint_icons.mjs`
- [ ] No emoji as icons — `lint_ui.mjs`
- [ ] Elevation declared once (border or shadow)
- [ ] Browser surfaces themed: selection, caret, focus ring, scrollbar where visible (`theme.css` covers the first three)

## Content

- [ ] Real or clearly marked placeholder content; no invented facts presented as real
- [ ] Buttons name their action; one name per action across the flow
- [ ] Errors say what happened and how to fix it; empty states give the next action
- [ ] Vietnamese copy checked with `vi-writing`
