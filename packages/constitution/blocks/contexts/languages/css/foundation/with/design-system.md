# Design system

> Governs how stylesheets spell and resolve the tokens, variants and modes of a design system.

## Variants

### cascading-variant-by-data-attribute → cascading-variant-set-once-on-ancestor · MUST

A variant that restyles descendants is a `data-*` attribute on their ancestor, which the stylesheet resolves.

| Why | Tags |
|---|---|
| the stylesheet then reaches every descendant, and no prop is passed down for looks. | [] |

## Modes

### color-scheme-declared-on-root → theme-follows-system-until-chosen · MUST

The root's `color-scheme` names every scheme the theme supports until the user chooses one, and the chosen scheme alone after, set before the first paint.

| Why | Tags |
|---|---|
| native controls, scrollbars and the page's canvas then follow the theme, and the system's preference reaches them before any style of the program applies. | [ux] |

### theme-colour-written-in-oklch → mode-values-derived-by-rule · SHOULD

The theme writes its colours as `oklch()`.

| Why | Tags |
|---|---|
| OKLCH is the colour space in which one lightness reads as equally light in every hue, which deriving a mode's values by rule needs. | [ux, a11y] |

### mode-colour-written-as-light-dark · SHOULD

A colour token whose value differs only between the light and the dark mode is declared once, as `light-dark(<light>, <dark>)`, and resolved by the `color-scheme` in force.

| Why | Tags |
|---|---|
| one declaration holds both values, so neither mode can miss the token, and the colour switches wherever a subtree sets its own `color-scheme`. | [ux] |

## Tokens

### custom-property-spells-its-token → token-name-follows-the-grammar · MUST

A custom property spells its token's name with dashes: `--color-text-muted` for `color.text.muted`.

| Why | Tags |
|---|---|
| the token and the property are then one name, found by one search in the theme and in every stylesheet. | [] |
