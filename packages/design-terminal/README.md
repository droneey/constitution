# Design for the terminal

`@droneey/design-terminal`: the design system of every droneey command line, drawn from `@droneey/design-tokens`.

| Entry | Offers |
|---|---|
| `@droneey/design-terminal` | the theme and its colour levels, the output a run chooses from its flags, `NO_COLOR` and its terminal, the glyphs and spinner frames, and the plain formatters |
| `@droneey/design-terminal/ink` | the `ThemeProvider`, `useTheme`, the components and prompts on Ink, and the view a program mounts on its streams |

An app hands its own accent, the `brand.tokens.json` it writes as `@droneey/design-tokens` describes, to `ThemeProvider` as `accent`: the theme takes each step of that scale in place of the default's, by its sRGB `hex`, and draws it at the run's colour level.

`bun run design:build` reads the tokens with Style Dictionary, mode by mode, and writes the default theme, `src/libs/ui/theme/constants/tokens.gen.ts`, committed; `design:check` fails when it is stale.
