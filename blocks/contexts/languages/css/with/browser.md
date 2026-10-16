# CSS with a browser

> Governs which features a stylesheet may use in a browser, and the sizes it takes from the viewport.

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
