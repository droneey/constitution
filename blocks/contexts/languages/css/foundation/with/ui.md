# CSS with user interfaces

> How a stylesheet serves screens: the pointer it has, and variants that reach every descendant.

## cascading-variant-by-data-attribute → cascading-variant-set-once-on-ancestor
A variant that restyles descendants is a `data-*` attribute on their ancestor, resolved by the stylesheet.

| Why | Check | Tags |
|---|---|---|
| the stylesheet then reaches every descendant, and no prop is drilled for looks. | review | [] |

## stylesheet-values-from-theme-properties → tokens-single-source-of-appearance
In a stylesheet, a colour, space, size, radius, shadow, duration or easing is read from a custom property of the theme, `var(--color-text-muted)`; a literal value appears only where the theme defines the property.

| Why | Check | Tags |
|---|---|---|
| a literal in a component is a second source of the value, which a change of the theme misses. | review | [] |

## custom-properties-spell-their-token → token-grammar-and-layers
A custom property spells its token's name with dashes: `--color-text-muted` for `color.text.muted`.

| Why | Check | Tags |
|---|---|---|
| the token and the property are then one name, found by one search in the theme and in every stylesheet. | review | [] |
