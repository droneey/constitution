# Media

> Governs media queries: how breakpoints build on the smallest screen, and the hover a style decorates.

## Breakpoints

### breakpoints-add-to-the-smallest-screen · SHOULD

Every breakpoint adds styles from a minimum width to base styles that serve the smallest screen. It never undoes for narrow screens a style set for wide ones.

| Why |
|---|
| a style set for wide screens must be undone in full for narrow ones, and what an undo misses breaks the smallest screen, which nobody on a wide one sees — mobile first. |

## Hover

### hover-effect-behind-hover-media · SHOULD

Every style that only decorates hover sits inside `@media (hover: hover)`.

| Why |
|---|
| a touch screen applies hover on a tap and keeps it until the next tap elsewhere, so the decoration sticks to whatever was touched last. |
