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

## components-adapt-by-container-queries → components-size-to-their-container
A component adapts to the space its container gives it with a container query; a media query adapts the page's layout and follows the user's preferences.

| Why | Check | Tags |
|---|---|---|
| a component placed in a sidebar and in the main column then fits both, while the viewport says nothing about the space it was given. | review | [ux] |

## global-styles-only-in-the-entry · SHOULD
Only the entry stylesheet and the theme it imports style elements and the document globally; every other stylesheet is scoped to one component.

| Why | Check | Tags |
|---|---|---|
| a global rule in a component's stylesheet reaches every screen and changes whenever that component is loaded. | review | [] |

## Accessibility

## focus-ring-from-design-system → focus-always-visible
The focus ring is the design system's, shown on `:focus-visible`; `outline: none` needs that replacement.

| Why | Check | Tags |
|---|---|---|
| one ring looks the same everywhere and is always visible to keyboard users. | review | [] |

## type-sized-in-rem → wcag-aa-conformance
Type sizes are in `rem`, text spacing may be overridden by the user, and at 320 CSS pixels content reflows without scrolling sideways.

| Why | Check | Tags |
|---|---|---|
| the user's own text size and spacing settings then apply, and a zoomed page stays readable. | review | [] |

## hover-styles-behind-hover-media → hover-content-reachable-by-focus-and-tap
A hover style that changes visibility has a state without hover, or sits behind `@media (hover: hover)`.

| Why | Check | Tags |
|---|---|---|
| on a touch screen hover never happens, and whatever it reveals would never appear. | review | [] |

## focus-ring-survives-forced-colors → focus-always-visible
The focus ring is an outline, or keeps a transparent outline beside a shadow, so it shows in forced-colors mode; nothing removes the outline outright.

| Why | Check | Tags |
|---|---|---|
| forced-colors mode drops shadows, so a ring drawn only as a shadow shows no focus there. | review | [a11y] |

## sticky-content-reserves-scroll-padding → wcag-aa-conformance
Content that stays on screen while the page scrolls — a header, a footer, a banner — reserves its size as the scroll padding, so a focused element is never hidden under it.

| Why | Check | Tags |
|---|---|---|
| focus moved under a sticky header is focus the user cannot see. | review | [a11y] |

## Layout

## popover-placed-by-anchor-positioning · SHOULD
A popover placed against its trigger by the stylesheet is placed by anchor positioning: `anchor-name` on the trigger, `position-anchor` and `position-area` on the popover.

| Why | Check | Tags |
|---|---|---|
| the browser places it and flips it at the viewport's edge from three declarations, with no measuring script and no frame of the wrong position. | review | [ux, performance] |

## mobile-first-additive-breakpoints · SHOULD
Base styles serve the smallest screen, and wider screens add overrides from a minimum width; nothing desktop-first is undone. No minimum width locks a screen out.

| Why | Check | Tags |
|---|---|---|
| styles that only add are simpler than styles that undo, and the smallest screen is never an afterthought. | review | [] |

## dynamic-viewport-units · MUST
Heights use the small viewport unit or the container — `svh` by default, `dvh` only where content must follow the toolbar — never `100vh` or `100vw`, and no layout width is fixed in pixels outside the tokens.

| Why | Check | Tags |
|---|---|---|
| `100vh` ignores the browser's own toolbars on phones, and content slides under them. | review | [] |
