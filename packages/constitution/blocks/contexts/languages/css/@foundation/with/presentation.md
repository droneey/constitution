# Presentation

> Governs how a stylesheet serves screens and components: their scope, focus, boundaries, text size, reflow, overlays, content revealed on hover, motion, the component variants and theme modes of their theme, and the direction of the reader's language.

## Components

### component-adapts-by-container-query → component-sizes-to-its-container · SHOULD

Every component adapts to its container's space by a container query, never by a media query on the viewport's width.

| Why |
|---|
| a component sized by the viewport's width overflows a narrow container on a wide screen, since the viewport says nothing about the space the component was given. |

### component-styles-scoped-to-its-root · MUST

Every component's stylesheet styles only the component's own elements. Its rules sit in `@scope (<its root>) to (<its slots>)`, or under its root's class where `@scope` is not available.

| Why |
|---|
| a rule that leaks reaches every screen that loads the component, and the lower boundary keeps it out of the content other components render in its slots. |

### global-style-only-in-the-entry-stylesheet · MUST

Every global style sits in the entry stylesheet or in a stylesheet it imports for the whole program. Such stylesheets include those of the reset layer, a base cascade layer and the theme, and a global style is one that styles elements by their type outside a component's scope, or the document as a whole.

| Why |
|---|
| a global style in a component's stylesheet reaches every screen, and changes whenever that component is or is not loaded. |

## Accessibility

### focus-ring-drawn-as-an-outline → focus-always-visible · MUST

Every focus ring is an outline, shown on `:focus-visible`. It is an outline of its own, or a transparent one beside a shadow, never an outline set to `none` or `0`.

| Why |
|---|
| forced-colors mode drops shadows and repaints outlines in the system's colour, so only a ring drawn as an outline survives it — WCAG 2.2, Focus Visible. |

### control-boundary-drawn-as-a-border → control-meets-the-non-text-contrast-minimum · MUST

Every control whose boundary a shadow or a background alone draws also carries a transparent border.

| Why |
|---|
| forced-colors mode drops shadows and backgrounds and paints borders in the system's colour, so only a border keeps a control apart from the text around it — WCAG 2.2, Non-text Contrast. |

### sticky-content-reserves-scroll-padding → focus-never-obscured · MUST

Every element that stays in view while its scroll container scrolls reserves its size as that container's `scroll-padding`. Such an element is sticky or fixed, such as a header, a footer or a banner.

| Why |
|---|
| focus moved under a sticky header is focus the user cannot see, while a reserved padding makes the browser scroll a focused element clear of it — WCAG 2.2, Focus Not Obscured (Minimum). |

### type-sized-in-rem → wcag-aa-conformance · MUST

Every font size is set relative to the root font size, never in `px` alone. That holds in a declaration and in a custom property that holds a font size alike, and the size is set in `rem`, in `em` or `%` that resolves from the root font size or from a size set in `rem`, by `inherit`, or by a math function, such as `clamp()`, `calc()`, `min()` or `max()`, each of whose arguments is set in one of these forms or adds a `rem` term. Exempt: the root's own font size, set as a percentage of the browser's default.

| Why |
|---|
| a size in pixels ignores the text size the user set in the browser, so text stays too small for the people who set it larger — WCAG 2.2, Resize Text. |

### text-spacing-overridable-without-clipping → wcag-aa-conformance · MUST

No box that shows text clips it when the user widens its spacing. No such box fixes its height while hiding its overflow, so text stays whole when the user sets line height to 1.5 times the font size, paragraph spacing to 2 times, letter spacing to 0.12 times and word spacing to 0.16 times. Exempt: a box visually hidden for assistive technology, and text cut to fit whose whole text can be reached.

| Why |
|---|
| people with low vision or dyslexia widen the spacing to read at all, and a box of fixed height cuts off what no longer fits — WCAG 2.2, Text Spacing. |

### content-reflows-at-320-css-pixels → wcag-aa-conformance · MUST

At a width of 320 CSS pixels, every screen's content reflows with no sideways scrolling. Exempt: content that needs two dimensions, such as a map or a data table.

| Why |
|---|
| a page zoomed to 400 percent is 320 CSS pixels wide, and reading line by line while scrolling sideways loses the reader — WCAG 2.2, Reflow. |

### text-wraps-instead-of-overflowing → wcag-aa-conformance · MUST

All text the program does not write wraps inside its box and never widens the page. Such text, such as a web address, an email address, a name or the user's input, breaks where a word would overflow its box, by `overflow-wrap: anywhere`.

| Why |
|---|
| one long word with no place to break pushes its box past the screen, and the whole page then scrolls sideways — WCAG 2.2, Reflow. |

### decorative-layer-lets-input-through → control-operable-by-every-input · MUST

Every decorative layer over interactive content lets input through. An element that only decorates and lies over such content, such as a glow, a gradient or a sheen, takes `pointer-events: none`.

| Why |
|---|
| an invisible layer over a control takes the click or the tap meant for it, and the control looks alive while nothing answers. |

### hover-reveal-also-on-focus → hover-content-reached-without-hover · MUST

All content a style reveals on `:hover` is revealed on `:focus-within` of the same element too.

| Why |
|---|
| a keyboard user never hovers, so content shown on hover alone never reaches them — WCAG 2.2, Keyboard. |

### motion-stopped-under-prefers-reduced-motion → reduced-motion-honoured · MUST

Wherever the media feature `prefers-reduced-motion` is `reduce`, the stylesheet stops every transition and animation that `reduced-motion-honoured` stops.

| Why |
|---|
| the media query is the one place a stylesheet learns that the person asked for less motion, so motion left outside it reaches the people it makes ill. |

## Variants

### cascading-variant-by-data-attribute → cascading-variant-set-once-on-ancestor · SHOULD

Every component variant that restyles descendants is a `data-*` attribute on their ancestor, which the stylesheet resolves.

| Why |
|---|
| a component variant passed down as a prop must be threaded through every descendant it restyles, and a descendant it misses keeps the old look. |

## Modes

### color-scheme-declared-on-root → theme-follows-system-until-chosen · MUST

Every document's root `color-scheme` names the schemes in force: each scheme the theme supports until its user chooses one, then the chosen one alone.

| Why |
|---|
| without it, native controls, scrollbars and the page's canvas keep the browser's light scheme under a dark theme. |

### mode-colour-written-as-light-dark · SHOULD

Every colour token that differs only between the light and the dark theme mode is declared once, as `light-dark()`. Its value is `light-dark(<light>, <dark>)`, resolved by the `color-scheme` in force.

| Why |
|---|
| a token declared once per theme mode can be missed in one of them, and a value chosen by a class on the root ignores a subtree that sets its own `color-scheme`. |

## Direction

### inline-side-written-logically → layout-mirrors-right-to-left · MUST

Wherever the program offers a language written right to left, every side along the line is written in its logical form. It is never left or right for a margin, a padding, a border, an inset, a float, a clear or a text alignment, each of which has a logical form, such as `margin-inline-start`, `inset-inline-end` and `text-align: start`. Exempt: numbers, media controls and logos, which keep their direction.

| Why |
|---|
| a side written as left or right stays put when a right-to-left language reverses the line, so the layout breaks there unless a second stylesheet mirrors it. |
