# Design for the browser

`@droneey/design-browser`: the design system of every droneey site, drawn from `@droneey/design-tokens`.

| Entry | Offers |
|---|---|
| `@droneey/design-browser/styles.css` | the theme as CSS variables and the base styles, the focus ring among them, with no framework |
| `@droneey/design-browser/tailwind.css` | Tailwind's theme over those variables, and the utilities `text-gradient-accent` and `focusable` |
| `@droneey/design-browser/react-dom` | the `ThemeProvider` with the `AccentScale` it takes, `Icon` by `IconName`, `Popover` with its trigger and panel, and `useGlide` |
| `@droneey/design-browser/react-dom/styles.css` | the look of those components |

The light mode is the root's; the class `dark` on an ancestor draws the dark mode below it. Whatever chooses the mode — the system's preference, a toggle, a library — sets that class.

An app reads its own accent, the `brand.tokens.json` it writes as `@droneey/design-tokens` describes, once with `AccentScale.create`, which throws a `MalformedAccentError`, code `malformed-accent`, whose `paths` name each place in the file holding no scale or no colour in OKLCH. It hands the scale to `ThemeProvider` as `accent`, which writes each step as the custom property the default's roles read, so every role of the accent follows it.

`bun run generate`, `design-tokens generate style-dictionary.config.ts`, has `@droneey/design-tokens`'s runner generate each mode of the tokens' resolver with this package's configuration of a mode, and writes in `src/libs/ui/theme/` the light mode on the root, the dark mode's own tokens and those that read them under `.dark`, the durations of reduced motion and Tailwind's theme. A style of text, a typography token such as `font.body.sm`, is the variable `--font-body-sm`, a `font` shorthand of its parts' variables, beside `--font-body-sm--letter-spacing`, the letter spacing the shorthand lacks, which a stylesheet applies together as `font: var(--font-body-sm); letter-spacing: var(--font-body-sm--letter-spacing)`, and in Tailwind the class `text-body-sm`, whose size, line height, letter spacing and weight are the same parts, beside `font-body`, the family of its kind; Tailwind's names of the other tokens of text — `text-sm`, `leading-sm`, `font-sans`, `tracking-normal` — are aliases of their primitives. They are ignored by git, not committed: a package that imports this one runs this generation before each of its scripts that reads them, through a hook that generates every package it depends on. The configuration and Tailwind's `@theme` format, which Style Dictionary lacks, live in `scripts/style-dictionary/`.
