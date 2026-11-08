# Design system

> Governs how stylesheets spell the tokens of a design system and write its theme modes' colours.

## Modes

### theme-colour-written-in-oklch → mode-values-derived-by-rule · MUST

Every colour the theme writes is an `oklch()` value.

| Why |
|---|
| in sRGB or HSL one lightness reads lighter in one hue than in another, so a theme mode's values derived by rule differ in contrast from hue to hue, while OKLCH keeps one lightness equally light in every hue. |

## Tokens

### custom-property-spells-its-token → token-name-follows-the-grammar · SHOULD

Every custom property that holds a token spells the token's name with dashes for its dots, as `--color-surface-muted` spells `color.surface.muted`.

| Why |
|---|
| a property named otherwise than its token is a second name for it, which a search for the token misses in the theme and in every stylesheet. |
