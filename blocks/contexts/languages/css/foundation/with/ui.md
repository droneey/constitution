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

## color-scheme-declared-on-root → theme-follows-system-until-chosen · MUST
The root declares `color-scheme` for the themes it supports.

| Why | Check | Tags |
|---|---|---|
| native controls, scrollbars and the page's canvas then follow the theme. | review | [ux] |

## no-literal-colour-outside-the-theme → stylesheet-values-from-theme-properties
No hexadecimal colour is written outside the theme's stylesheet.

| Why | Check | Tags |
|---|---|---|
| a literal colour is a value the next theme change misses. | tool/lint | [ux] |

## theme-colours-in-oklch → light-and-dark-one-token-set
The theme writes its colours as `oklch()`.

| Why | Check | Tags |
|---|---|---|
| OKLCH is the colour space where one lightness reads as equally light in every hue, which the derivation by rule needs. | review | [ux, a11y] |

## theme-writes-no-hexadecimal-colour → theme-colours-in-oklch
The theme writes no hexadecimal colour.

| Why | Check | Tags |
|---|---|---|
| hexadecimal is the form a colour copied from a design tool arrives in, and the one the lint can see. | tool/lint | [] |

## components-adapt-by-container-queries · SHOULD
A component adapts to the space its container gives it with a container query; a media query adapts the page's layout and follows the user's preferences.

| Why | Check | Tags |
|---|---|---|
| a component placed in a sidebar and in the main column then fits both, while the viewport says nothing about the space it was given. | review | [ux] |

## global-styles-only-in-the-entry · SHOULD
Only the entry stylesheet and the theme it imports style elements and the document globally; every other stylesheet is scoped to one component.

| Why | Check | Tags |
|---|---|---|
| a global rule in a component's stylesheet reaches every screen and changes whenever that component is loaded. | review | [] |
