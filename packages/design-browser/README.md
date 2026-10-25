# Design for the browser

`@droneey/design-browser`: the design system of every droneey site, drawn from `@droneey/design-tokens`.

| Entry | Offers |
|---|---|
| `@droneey/design-browser/styles.css` | the theme as CSS variables and the base styles, the focus ring among them, with no framework |
| `@droneey/design-browser/tailwind.css` | Tailwind's theme over those variables, and the utilities `text-gradient-accent` and `focusable` |
| `@droneey/design-browser/react-dom` | the `ThemeProvider`, `Icon` by `IconName`, `Popover` with its trigger and panel, and `useGlide` |
| `@droneey/design-browser/react-dom/styles.css` | the look of those components |

The light mode is the root's; the class `dark` on an ancestor draws the dark mode below it. Whatever chooses the mode — the system's preference, a toggle, a library — sets that class.

An app hands its own accent, the `brand.tokens.json` it writes as `@droneey/design-tokens` describes, to `ThemeProvider` as `accent`: it writes each step of that scale as the custom property the default's roles read, so every role of the accent follows it.

`bun run build`, `design-tokens build style-dictionary.config.ts`, has `@droneey/design-tokens`'s runner build each mode of the tokens' resolver with this package's configuration of a mode, and writes in `src/libs/ui/theme/` the light mode on the root, the dark mode's own roles under `.dark`, the durations of reduced motion and Tailwind's theme. They are ignored by git, not committed: a package that imports this one runs this build before each of its scripts that reads them, through a hook that builds every package it depends on. The configuration and Tailwind's `@theme` format, which Style Dictionary lacks, live in `src/libs/style-dictionary/`.
