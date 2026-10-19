# Browser

> Governs the fonts a stylesheet loads in a browser, the features it may use there and the sizes it takes from the viewport.

## Code

### web-font-served-as-woff2 · SHOULD

A web font is served as WOFF2 alone, and its `@font-face` sets a `font-display` that shows text while the font loads: `swap`, `fallback` or `optional`.

| Why | Tags |
|---|---|
| WOFF2 is the smallest form of a font and the browsers a Baseline target covers read it, and a font that blocks its text leaves it invisible for up to three seconds on a slow network. | [performance, ux] |

## Dependencies

### stylesheet-feature-beyond-the-target-behind-supports → feature-beyond-the-target-detected-first · SHOULD

A feature of CSS the declared target does not cover is used only behind `@supports`, with a fallback, or with a polyfill the program loads.

| Why | Tags |
|---|---|
| a feature a supported browser lacks breaks silently there, often by dropping the whole rule that uses it, for users nobody on the team sees. | [ux] |

## Viewport

### viewport-size-in-small-viewport-units · MUST

A size taken from the viewport leaves out what the browser draws over it: a height is in `svh`, or in `dvh` where content must follow the toolbars as they slide, never in `vh`; a full width is `100%` of its containing block, never `100vw`.

| Why | Tags |
|---|---|
| `vh` counts the space under a phone browser's toolbars, so content slides beneath them, and `100vw` counts the scrollbar, so the page scrolls sideways. | [ux] |
