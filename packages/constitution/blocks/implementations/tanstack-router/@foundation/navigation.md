# Navigation

> Governs a link, preloading and the focus after a navigation.

## General

### links-name-typed-targets · MUST

Every link names its route by typed `to` and `params`, never a path built from strings. Link data handed to another component is built with `linkOptions`.

| Why |
|---|
| a typed target fails the type check when the route moves; a built string fails in the user's hands. |

### routes-preload-on-intent · SHOULD

Every router is created with `defaultPreload: 'intent'`, so hovering, focusing or touching a link starts its route's loader.

| Why |
|---|
| without it the loader starts only on the click, and the user waits for data that could have been on its way. |

### focus-moved-when-a-navigation-resolves → navigation-moves-focus-to-the-main-heading · MUST

The root route moves focus to the new screen's main heading when a navigation resolves. It subscribes to the router's `onResolved` event. Exempt: a navigation that only changes a parameter of the same screen.

| Why |
|---|
| the router changes the screen without touching focus, so a keyboard or screen-reader user is left on a control of the old screen; the root sees every resolved navigation, so one handler there covers them all. |
