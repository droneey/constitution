# CSS with a design system

> Governs how stylesheets spell and resolve the tokens of a design system.

### cascading-variant-by-data-attribute → cascading-variant-set-once-on-ancestor · MUST
A variant that restyles descendants is a `data-*` attribute on their ancestor, resolved by the stylesheet.

| Why | Tags |
|---|---|
| the stylesheet then reaches every descendant, and no prop is drilled for looks. | [] |

### color-scheme-declared-on-root → theme-follows-system-until-chosen · MUST
The root declares `color-scheme` for the themes it supports.

| Why | Tags |
|---|---|
| native controls, scrollbars and the page's canvas then follow the theme. | [ux] |

### custom-properties-spell-their-token → token-name-follows-the-grammar · MUST
A custom property spells its token's name with dashes: `--color-text-muted` for `color.text.muted`.

| Why | Tags |
|---|---|
| the token and the property are then one name, found by one search in the theme and in every stylesheet. | [] |

### theme-colours-in-oklch → mode-values-derived-by-rule · SHOULD
The theme writes its colours as `oklch()`.

| Why | Tags |
|---|---|
| OKLCH is the colour space where one lightness reads as equally light in every hue, which the derivation by rule needs. | [ux, a11y] |
