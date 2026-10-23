# Design for the web

`@droneey/design-web`: the design system of every droneey site, drawn from `@droneey/design-tokens`.

| Entry | Offers |
|---|---|
| `@droneey/design-web/styles.css` | the theme as CSS variables and the base styles, the focus ring among them, with no framework |
| `@droneey/design-web/tailwind.css` | Tailwind's theme over those variables, and the utilities `text-gradient-accent` and `focusable` |
| `@droneey/design-web/react-dom` | the `ThemeProvider`, `Icon` by `IconName`, `Popover` with its trigger and panel, and `useGlide` |
| `@droneey/design-web/react-dom/styles.css` | the look of those components |

The light mode is the root's; the class `dark` on an ancestor draws the dark mode below it. Whatever chooses the mode — the system's preference, a toggle, a library — sets that class.

An app hands its own accent, the `brand.tokens.json` it writes as `@droneey/design-tokens` describes, to `ThemeProvider` as `accent`: it writes each step of that scale as the primitive the default's roles read, so every role of the accent follows it.

`bun run design:build` reads the tokens with Style Dictionary, mode by mode, and writes the stylesheet and Tailwind's theme in `src/libs/ui/theme/`, both committed; `design:check` fails when either is stale.
