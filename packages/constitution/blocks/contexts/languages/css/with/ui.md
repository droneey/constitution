# CSS with a user interface

> Governs how a stylesheet serves screens and components: focus, text size, reflow, hover, motion, values and scope.

## Screens

### breakpoints-add-to-the-smallest-screen · SHOULD

Base styles serve the smallest screen, and a breakpoint only adds styles from a minimum width; no style is set for wide screens and undone for narrow ones.

| Why | Tags |
|---|---|
| styles that only add are simpler than styles that undo, and the smallest screen is never an afterthought. | [] |

## Components

### stylesheet-value-read-from-the-theme → tokens-single-source-of-appearance · MUST

In a stylesheet, a colour, space, size, font, radius, shadow, duration or easing — a layout's width included — is read from a custom property of the theme, `var(--color-text-muted)`; a literal appears only where the theme defines the property, and in a value no theme names — `0`, a percentage, a viewport unit, `auto` — and in the condition of a media or a container query, where `var()` cannot be read and the literal repeats a breakpoint the theme names.

| Why | Tags |
|---|---|
| a literal in a component is a second source of the value, which a change of the theme misses. | [] |

### component-adapts-by-container-query → component-sizes-to-its-container · SHOULD

A component adapts to the space its container gives it by a container query, never by a media query on the viewport's width.

| Why | Tags |
|---|---|
| a component placed in a sidebar and in the main column then fits both, while the viewport says nothing about the space it was given. | [ux] |

### component-styles-scoped-to-its-root · SHOULD

A component's stylesheet styles only the component's own elements: its rules sit in `@scope (<its root>) to (<its slots>)` where every browser the program supports has `@scope`, and under its root's class where one does not.

| Why | Tags |
|---|---|
| a rule that leaks reaches every screen that loads the component, and the lower boundary keeps it out of the content other components render in its slots. | [] |

### global-style-only-in-the-entry-stylesheet · SHOULD

Only the entry stylesheet, and the theme it imports, style elements by their type and the document as a whole.

| Why | Tags |
|---|---|
| a global rule in a component's stylesheet reaches every screen, and changes whenever that component is or is not loaded. | [] |

## Accessibility

### focus-ring-drawn-as-an-outline → focus-always-visible · MUST

Focus is shown on `:focus-visible` by an outline, or by a transparent outline beside a shadow, and no style sets the outline to `none` or `0`.

| Why | Tags |
|---|---|
| forced-colors mode drops shadows and repaints outlines in the system's colour, so only a ring drawn as an outline survives it. | [a11y] |

### sticky-content-reserves-scroll-padding → focus-always-visible · MUST

Content that stays on screen while the page scrolls — a header, a footer, a banner — reserves its size as the scroll container's `scroll-padding`.

| Why | Tags |
|---|---|
| the browser then scrolls a focused element clear of it, and focus moved under a sticky header is focus the user cannot see. | [a11y] |

### type-sized-in-rem · MUST

A font size is set in `rem`, in `em` relative to one, or by a `clamp()` whose bounds are in `rem` and whose preferred value adds a `rem` term, never in `px`.

| Why | Tags |
|---|---|
| a size in `rem` follows the text size the user set in the browser, which a size in pixels ignores. | [a11y] |

### text-spacing-overridable-without-clipping → wcag-aa-conformance · MUST

No box that shows text clips it — none fixes its height while hiding its overflow, save one visually hidden for assistive technology — so text stays whole when the user sets line height to 1.5 times the font size, paragraph spacing to 2 times, letter spacing to 0.12 times and word spacing to 0.16 times.

| Why | Tags |
|---|---|
| people with low vision or dyslexia widen the spacing to read at all, and a box of fixed height cuts off what no longer fits. | [a11y] |

### content-reflows-at-320-css-pixels → wcag-aa-conformance · MUST

At a width of 320 CSS pixels, content reflows into one column with no sideways scrolling, save content that needs two dimensions, such as a map or a data table.

| Why | Tags |
|---|---|
| a page zoomed to 400 percent is 320 CSS pixels wide, and reading line by line while scrolling sideways loses the reader. | [a11y] |

### hover-reveal-also-on-focus → hover-content-reachable-and-dismissible · MUST

Content a style reveals on `:hover` is revealed on `:focus-within` of the same element too.

| Why | Tags |
|---|---|
| a keyboard user never hovers, so content shown on hover alone never reaches them. | [a11y] |

### hover-effect-behind-hover-media · SHOULD

A style that only decorates hover sits inside `@media (hover: hover)`.

| Why | Tags |
|---|---|
| a touch screen applies hover on a tap and keeps it until the next tap elsewhere, so the decoration sticks to whatever was touched last. | [ux] |

### motion-reduced-under-reduced-motion → reduced-motion-honoured · MUST

A transition or an animation that moves, scales or rotates content runs only inside `@media (prefers-reduced-motion: no-preference)`; under `reduce`, its change is a cut or a fade.

| Why | Tags |
|---|---|
| motion across the screen makes people with vestibular disorders ill, while a cut or a fade keeps the feedback the motion carried. | [a11y] |
