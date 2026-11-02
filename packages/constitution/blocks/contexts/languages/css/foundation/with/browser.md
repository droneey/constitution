# Browser

> Governs a stylesheet in a browser: the fonts it loads, the features it may use there and the sizes it takes from the viewport.

## Bundle

### web-font-served-as-woff2 · SHOULD

A web font is served as WOFF2 alone and shows its text while it loads. Its `@font-face` sets a `font-display` of `swap`, `fallback` or `optional`.

| Why |
|---|
| a font served in a heavier form costs every visitor its bytes, though every browser a Baseline target covers reads WOFF2, and a font that blocks its text leaves it invisible for up to three seconds on a slow network. |

## Dependencies

### stylesheet-feature-beyond-the-target-behind-supports → feature-beyond-the-target-detected-first · SHOULD

A feature of CSS the declared target does not cover is used only behind `@supports`, with a fallback, or with a polyfill the program loads.

| Why |
|---|
| a feature a supported browser lacks breaks silently there, often by dropping the whole rule that uses it, for users nobody on the team sees. |

## Viewport

### viewport-size-leaves-out-what-the-browser-draws · MUST

A size taken from the viewport leaves out what the browser draws over it. A height is in `svh`, or in `dvh` where content must follow the toolbars as they slide, never in `vh`; a full width is `100%` of its containing block, never `100vw`.

| Why |
|---|
| `vh` counts the space under a phone browser's toolbars, so content slides beneath them, and `100vw` counts the scrollbar, so the page scrolls sideways. |
