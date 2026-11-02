# Design system

> Governs how stylesheets spell and resolve the tokens, variants and modes of a design system.

## Variants

### cascading-variant-by-data-attribute → cascading-variant-set-once-on-ancestor · MUST

A variant that restyles descendants is a `data-*` attribute on their ancestor, which the stylesheet resolves.

| Why |
|---|
| a variant passed down as a prop must be threaded through every descendant it restyles, and a descendant it misses keeps the old look. |

## Modes

### color-scheme-declared-on-root → theme-follows-system-until-chosen · MUST

The root's `color-scheme` names the schemes in force. It names every scheme the theme supports until the user chooses one, and the chosen scheme alone after, set before the first paint.

| Why |
|---|
| without it, native controls, scrollbars and the page's canvas keep the browser's light scheme under a dark theme, and a scheme set after the first paint flashes the wrong one first. |

### theme-colour-written-in-oklch → mode-values-derived-by-rule · SHOULD

The theme writes its colours as `oklch()`.

| Why |
|---|
| in sRGB or HSL one lightness reads lighter in one hue than in another, so a mode's values derived by rule differ in contrast from hue to hue, while OKLCH keeps one lightness equally light in every hue. |

### mode-colour-written-as-light-dark · SHOULD

A colour token that differs only between the light and the dark mode is declared once, as `light-dark()`. Its value is `light-dark(<light>, <dark>)`, resolved by the `color-scheme` in force.

| Why |
|---|
| a token declared once per mode can be missed in one of them, and a value chosen by a class on the root ignores a subtree that sets its own `color-scheme`. |

## Tokens

### custom-property-spells-its-token → token-name-follows-the-grammar · MUST

A custom property spells its token's name with dashes.

| Why |
|---|
| a property named otherwise than its token is a second name for it, which a search for the token misses in the theme and in every stylesheet. |

### font-size-token-in-rem → wcag-aa-conformance · MUST

A font-size token's value is in `rem`.

| Why |
|---|
| a font-size token in pixels carries its pixels into every text that takes it, so one token's value keeps the whole user interface from the text size its user set — WCAG 2.2, Resize Text. |

### motion-tokens-collapse-under-reduced-motion → reduced-motion-honoured · MUST

Under reduced motion, the root redefines the motion tokens. Under `@media (prefers-reduced-motion: reduce)`, their durations fall to zero or a movement becomes a fade.

| Why |
|---|
| motion reduced animation by animation is missed in some of them, while every animation reads the tokens, so one rule in the theme stops them all. |
