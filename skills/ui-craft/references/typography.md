# Typography

Type carries most of an interface's personality, especially in operate mode where color and layout must stay quiet.

## Choosing faces

1. Decide the **character** from the direction: geometric/humanist/grotesque sans, old-style/transitional/slab/wedge serif, condensed, rounded, monospaced…
2. Get candidates that **support Vietnamese**:
   ```bash
   python3 <skill>/scripts/fonts_vi.py --category sans --uncommon --shuffle --limit 25
   python3 <skill>/scripts/fonts_vi.py --category serif --variable --italic
   python3 <skill>/scripts/fonts_vi.py --check "Family A" "Family B"
   ```
   Only about a quarter of Google Fonts families include Vietnamese (520 of 1,950 in Oct 2026). Several faces that design prompts often recommend have none (DM Sans, Instrument Serif, Syne, Outfit, Sora, Fira Code). `--shuffle` breaks the habit of picking the same top results; a `common` tag (popularity rank ≤ 150) means the face alone adds little identity.
3. Look at the face **with Vietnamese text at display size** in the specimen. Some families technically contain the glyphs but place marks badly (marks colliding with the horn of ơ/ư, tone marks drifting from the vowel, stacked marks ế ổ ẫ too tall). Reject those.
4. Use **one or two families**. With two, make them clearly different in structure (serif + sans, condensed + regular, mono + humanist), not two similar sans faces.
5. Prefer variable fonts when weights vary: one file, any weight. Fontsource names variable families `"<Name> Variable"`; `tokens.mjs` writes both names into the stack.

## Scale

Name the styles by role (`display, h1, h2, h3, body, small, label`) and set every text through `type-<name>`. No other font sizes.

| Mode | Step ratio | Body | Notes |
|---|---|---|---|
| operate | 1.125–1.2 | 14–16px (16 preferred) | compact headings; weight and color do the hierarchy |
| read | 1.2–1.25 | 17–20px | generous measure control |
| persuade / experience | 1.25–1.5, plus one large display jump | 16–18px | the display style can be the bold move |

Neighbouring steps must differ visibly (≥ ~6%); `tokens.mjs` warns otherwise.

## Spacing of text

- **Measure:** body 60–75 characters (`max-w-[65ch]` on prose containers is fine; it is a width, not a design value).
- **Line height:** body 1.5–1.7 for Vietnamese (stacked diacritics need room); headings 1.15–1.3; display never below ~1.1. Below that, marks such as ế, ổ, ẫ collide with the line above or get clipped by `overflow: hidden`.
- **Tracking:** display −0.01 to −0.03em; never below −0.04em. Body 0. All-caps text, if used at all, needs +0.04–0.08em and should not carry diacritics at small sizes.
- **Wrapping:** `text-balance` for headings, `text-pretty` for paragraphs.
- More space above a heading than below it, so it belongs to what follows.

## Numbers and data

- `tabular-nums` in tables, prices, timers, anything compared vertically.
- Vietnamese formats: `1.250.000 đ`, `98,5%`, dates `21/10/2026` (details in `vi-writing`).
- Right-align numeric columns; align decimal places.

## Loading fonts

Self-host with fontsource in `src/styles/fonts.ts` (`tokens.mjs` prints the packages):

```ts
import '@fontsource-variable/<family>';        // variable: all weights
import '@fontsource/<family>/400.css';         // static: one import per weight used
```

The default fontsource CSS includes the Vietnamese subset. Per-subset files such as `latin-400.css` do **not**; `shoot.mjs` measures glyphs and reports Vietnamese text drawn by a fallback font.
