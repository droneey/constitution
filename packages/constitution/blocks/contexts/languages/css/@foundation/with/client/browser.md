# Browser

> Governs a stylesheet in a browser: the fonts it loads, the capabilities it may use there and the sizes it takes from the viewport.

## Bundle

### web-font-served-as-woff2 · MUST

Every web font is served as WOFF2 alone.

| Why |
|---|
| a font served in a heavier form costs every visitor its bytes, though every current browser reads WOFF2. |

### web-font-shows-its-text-while-it-loads · MUST

Every web font shows its text while it loads: its `@font-face` sets a `font-display` of `swap`, `fallback` or `optional`.

| Why |
|---|
| a font that blocks its text leaves it invisible for up to three seconds on a slow network. |

## Dependencies

### stylesheet-capability-beyond-the-target-behind-supports → capability-beyond-the-target-detected-first · MUST

Every stylesheet capability beyond the support target is used only inside an `@supports` query that tests for it. Exempt: a capability no such query can test, such as a new at-rule, which instead follows its fallback, kept by a browser that lacks the capability when it drops the at-rule.

| Why |
|---|
| a capability a supported browser lacks breaks silently there, often by dropping the whole rule that uses it, for users nobody on the team sees. |

## Viewport

### viewport-height-leaves-out-the-browsers-toolbars · MUST

Every viewport height leaves out the browser's toolbars. It is in `svh`, or in `dvh` where content follows the toolbars as they slide, never in `vh`.

| Why |
|---|
| `vh` counts the space under a phone browser's toolbars, so content slides beneath them. |

### full-width-leaves-out-the-scrollbar · MUST

Every full width leaves out the browser's scrollbar. It is `100%` of its containing block, never `100vw`.

| Why |
|---|
| `100vw` counts the scrollbar, so the page scrolls sideways. |
