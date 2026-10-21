# Saturated defaults (as of 2026-10)

Patterns that generated interfaces fall into regardless of subject. They are **defaults, not bans**: each is right for some brief. Use one only when the brief asks for it or when you chose it for a reason you can write in the decision log. Every item has an alternative, because a prohibition alone just moves the output to the next default.

Defaults drift. In 2024–2025 the anti-slop advice ("avoid Inter and purple, use a serif on cream") produced a new default of its own (cream + serif + terracotta). Review this list every few months; sources are at the end.

## Color

| Default | Instead |
|---|---|
| purple/indigo → blue gradients on white; cyan or acid-green on near-black | derive hue and temperature from the subject's materials; one accent with a stated job |
| warm cream (~#F4F1EA) + serif + terracotta/clay (~#D97757) | if warm paper fits, change something structural: cooler ink, a non-clay accent, a different type genre |
| near-black (#0B0B0B, #111) + one neon accent | dark theme only when the use scene is dark; tint the dark toward the subject's hue |
| a different color per card, tag, or side stripe | color only for meaning: accent for action/selection, status colors for status; group with space and type |
| radial glows, spotlights, aurora blobs behind the hero | a real image, texture, or nothing; atmosphere from type and composition |
| gradient text on headings and metrics | solid ink; emphasis from size and weight |
| gray text on a colored surface | text tinted from the surface's hue, still ≥ 4.5:1 |

## Type

| Default | Instead |
|---|---|
| Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, Space Grotesk, Geist for everything | pick by character from `fonts_vi.py --uncommon --shuffle`; a common face is fine when it is a deliberate choice |
| italic serif display headline with one accented word | let the whole headline carry the voice; no single colored/italic word |
| tracked ALL-CAPS eyebrow above every heading | a heading that says the thing; labels only where they encode information |
| one font size jump (huge hero, everything else 14–16px) | a real scale with 4–6 steps, each visibly different |
| monospace as a "technical" costume for labels | mono only for code, data, measurements |
| meta strings joined with middle dots "A · B · C"; "WORD — fragment" labels | plain sentences or a real table/list |

## Layout

| Default | Instead |
|---|---|
| centered hero, big number + small label, three equal feature cards | a layout concept from the subject (timeline, ledger, map, catalog, board…) |
| everything in identical rounded cards with the same soft shadow | group with space and alignment; cards only for things that are objects (movable, selectable) |
| cards inside cards | flatten; one container level |
| numbered markers 01 / 02 / 03 on non-sequences | numbers only for real steps or timelines |
| icon in a rounded-square tile above every heading | icons inline with text, or no icon |
| uniform section padding, every section the same height | rhythm: tight within groups, generous between, varied section weight |
| decorative grid lines or stripes in the background | a background with a reason (the subject's paper, map, blueprint) or plain |

## Components and details

| Default | Instead |
|---|---|
| one radius on everything (often 12–16px) | 2–3 radii with hierarchy; inner radius = outer − padding |
| hairline border **and** wide soft shadow | elevation declared once: border or shadow |
| colored dots and pulsing status indicators everywhere | dots only for live status; otherwise a word |
| emoji or Unicode glyphs as icons; "→" appended to every link and button | one icon library through `<Icon>`; plain link text |
| badges/pills above the hero headline ("New ✨") | put news in the content, or nowhere |

## Motion

| Default | Instead |
|---|---|
| fade-and-slide-up on every section; hover lift on every card | one orchestrated moment; hover feedback only on interactive things |
| bounce/elastic easing, marquees, blinking cursors | exponential ease-out, 150–250 ms for UI; motion that answers an action |

## Copy

| Default | Instead |
|---|---|
| generic claims ("Seamless", "Supercharge", "All-in-one platform", "Giải pháp toàn diện") | concrete nouns and numbers from the brief |
| forced contrast ("Not a tool. A platform.") | say what it does |
| em-dash-heavy, rhetorical copy | short sentences; Vietnamese copy through `vi-writing` |
| invented testimonials, logos, metrics | only supplied facts; label placeholders as placeholders |

## Sources

- Anthropic, *Improving frontend design through skills* (2025-11-12) and the frontend-design skill (local plugin copy, read 2026-10-11).
- Impeccable slop catalog, impeccable.style/slop, and `craft-floor.md` in github.com/pbakaus/impeccable (read 2026-10-11).
- The Fountain Institute, *7 tells that a UI is AI-generated*; DeSlop (github.com/nate-zz/DeSlop).
