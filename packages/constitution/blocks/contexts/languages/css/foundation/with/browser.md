# Browser

> Governs the fonts a stylesheet loads in a browser, the features it may use there, where it places a popover and the sizes it takes from the viewport.

## Bundle

### web-font-served-as-woff2 · SHOULD

A web font is served as WOFF2 alone, and its `@font-face` sets a `font-display` that shows text while the font loads: `swap`, `fallback` or `optional`.

| Why |
|---|
| WOFF2 is the smallest form of a font and the browsers a Baseline target covers read it, and a font that blocks its text leaves it invisible for up to three seconds on a slow network. |

## Dependencies

### stylesheet-feature-beyond-the-target-behind-supports → feature-beyond-the-target-detected-first · SHOULD

A feature of CSS the declared target does not cover is used only behind `@supports`, with a fallback, or with a polyfill the program loads.

| Why |
|---|
| a feature a supported browser lacks breaks silently there, often by dropping the whole rule that uses it, for users nobody on the team sees. |

## Popovers

### native-popover-anchored-to-its-trigger · SHOULD

Unless another active block brings primitives that place their own popovers, a native `popover` is placed against its trigger by the browser's anchor positioning — `anchor-name` on the trigger, `position-anchor` and `position-area` on the popover — where every target browser has it, and otherwise behind `@supports` with a fallback.

| Why |
|---|
| the browser keeps the popover beside its trigger through scrolling and resizing, with no positioning library to load. |

## Viewport

### viewport-size-in-small-viewport-units · MUST

A size taken from the viewport leaves out what the browser draws over it: a height is in `svh`, or in `dvh` where content must follow the toolbars as they slide, never in `vh`; a full width is `100%` of its containing block, never `100vw`.

| Why |
|---|
| `vh` counts the space under a phone browser's toolbars, so content slides beneath them, and `100vw` counts the scrollbar, so the page scrolls sideways. |
