# Design for the command line

`@droneey/design-cli`: the design system of every droneey command line, drawn from `@droneey/design-tokens`.

| Entry | Offers |
|---|---|
| `@droneey/design-cli` | the theme and its colour levels, the output a run chooses from its flags, `NO_COLOR` and its terminal, the glyphs and spinner frames, the plain formatters, and the measures they lay text out by — the space steps, a text's width in cells and its padding |
| `@droneey/design-cli/ink` | the `ThemeProvider`, `useTheme`, the components and prompts on Ink, and the view a program mounts on its streams |

An app hands its own accent, the `brand.tokens.json` it writes as `@droneey/design-tokens` describes, to `ThemeProvider` as `accent`: the theme takes each step of that scale in place of the default's, by its sRGB `hex`, and draws it at the run's colour level.

`bun run generate`, `design-tokens generate style-dictionary.config.ts`, has `@droneey/design-tokens`'s runner generate each mode of the tokens' resolver with this package's configuration of a mode, and writes each mode's default theme, `src/libs/ui/theme/constants/<mode>.gen.ts`. They are ignored by git, not committed: each script of this package that reads them, and each such script of a package that imports this one, runs this generation first through a hook. The configuration and the terminal's module format, which Style Dictionary lacks, live in `src/libs/style-dictionary/`.
