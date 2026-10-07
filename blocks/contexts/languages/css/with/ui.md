# CSS with user interfaces

> How a stylesheet serves screens: the pointer it has, and variants that reach every descendant.

### cascading-variant-by-data-attribute → cascading-variant-set-once-on-ancestor · SHOULD
A variant that restyles descendants is a `data-*` attribute on their ancestor, resolved by the stylesheet.

| Why | Tags |
|---|---|
| the stylesheet then reaches every descendant, and no prop is drilled for looks. | [] |

### stylesheet-values-from-theme-properties → tokens-single-source-of-appearance · MUST
In a stylesheet, a colour, space, size, radius, shadow, duration or easing is read from a custom property of the theme, `var(--color-text-muted)`; a literal value appears only where the theme defines the property. No stylesheet writes a hexadecimal colour, the theme's included.

| Why | Tags |
|---|---|
| a literal in a component is a second source of the value, which a change of the theme misses. | [] |

### custom-properties-spell-their-token → token-grammar-and-layers · MUST
A custom property spells its token's name with dashes: `--color-text-muted` for `color.text.muted`.

| Why | Tags |
|---|---|
| the token and the property are then one name, found by one search in the theme and in every stylesheet. | [] |

### color-scheme-declared-on-root → theme-follows-system-until-chosen · MUST
The root declares `color-scheme` for the themes it supports.

| Why | Tags |
|---|---|
| native controls, scrollbars and the page's canvas then follow the theme. | [ux] |

### theme-colours-in-oklch → light-and-dark-one-token-set · SHOULD
The theme writes its colours as `oklch()`.

| Why | Tags |
|---|---|
| OKLCH is the colour space where one lightness reads as equally light in every hue, which the derivation by rule needs. | [ux, a11y] |

### components-adapt-by-container-queries → components-size-to-their-container · SHOULD
A component adapts to the space its container gives it with a container query; a media query adapts the page's layout and follows the user's preferences.

| Why | Tags |
|---|---|
| a component placed in a sidebar and in the main column then fits both, while the viewport says nothing about the space it was given. | [ux] |

### global-styles-only-in-the-entry · SHOULD
Only the entry stylesheet and the theme it imports style elements and the document globally; every other stylesheet is scoped to one component.

| Why | Tags |
|---|---|
| a global rule in a component's stylesheet reaches every screen and changes whenever that component is loaded. | [] |

## Accessibility

### focus-ring-from-design-system → focus-always-visible · MUST
The focus ring is the design system's, shown on `:focus-visible`; `outline: none` needs that replacement.

| Why | Tags |
|---|---|
| one ring looks the same everywhere and is always visible to keyboard users. | [] |

### text-scales-and-content-reflows → wcag-aa-conformance · MUST
Type sizes are in `rem`, text spacing may be overridden by the user, and at 320 CSS pixels content reflows without scrolling sideways.

| Why | Tags |
|---|---|
| the user's own text size and spacing settings then apply, and a zoomed page stays readable. | [] |

### hover-styles-behind-hover-media → hover-content-reachable-by-focus-and-tap · MUST
A hover style that changes visibility has a state without hover, or sits behind `@media (hover: hover)`.

| Why | Tags |
|---|---|
| on a touch screen hover never happens, and whatever it reveals would never appear. | [] |

### focus-ring-survives-forced-colors → focus-always-visible · MUST
The focus ring is an outline, or keeps a transparent outline beside a shadow, so it shows in forced-colors mode; nothing removes the outline outright.

| Why | Tags |
|---|---|
| forced-colors mode drops shadows, so a ring drawn only as a shadow shows no focus there. | [a11y] |

### sticky-content-reserves-scroll-padding → wcag-aa-conformance · MUST
Content that stays on screen while the page scrolls — a header, a footer, a banner — reserves its size as the scroll padding, so a focused element is never hidden under it.

| Why | Tags |
|---|---|
| focus moved under a sticky header is focus the user cannot see. | [a11y] |

## Layout

### mobile-first-additive-breakpoints · SHOULD
Base styles serve the smallest screen, and wider screens add overrides from a minimum width; nothing desktop-first is undone. No minimum width locks a screen out.

| Why | Tags |
|---|---|
| styles that only add are simpler than styles that undo, and the smallest screen is never an afterthought. | [] |

### viewport-sizes-in-small-viewport-units · MUST
A size taken from the viewport uses the small viewport unit or the container — `svh` by default, `dvh` only where content must follow the toolbar — never `100vh` or `100vw`.

| Why | Tags |
|---|---|
| `100vh` ignores the browser's own toolbars on phones, and content slides under them. | [] |

### layout-width-from-the-tokens · MUST
No layout width is fixed in pixels outside the tokens.

| Why | Tags |
|---|---|
| a width fixed in a component overflows a narrower screen, and is a size the theme no longer owns. | [ux] |
