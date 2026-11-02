# Navigation

> Governs a link, preloading and the focus after a navigation.

## General

### links-name-typed-targets · SHOULD

A link names its route by typed `to` and `params`, never a path built from strings. Link data handed to another component is built with `linkOptions`.

| Why |
|---|
| a typed target fails the type check when the route moves; a built string fails in the user's hands. |

### routes-preload-on-intent · SHOULD

Routes preload on intent. The router is created with `defaultPreload: 'intent'`, so hovering, focusing or touching a link starts its route's loader.

| Why |
|---|
| without it the loader starts only on the click, and the user waits for data that could have been on its way. |

### focus-moved-when-a-navigation-resolves → navigation-moves-focus-to-the-view · MUST

The root route moves focus to the new view when a navigation resolves. It subscribes to the router's `onResolved` event and moves focus to the view's main heading, unless only the view's search or parameters changed; the title comes from the route's `head`.

| Why |
|---|
| the router changes the view without touching focus, so a keyboard or screen-reader user is left on a control of the old view; the root sees every resolved navigation, so one handler there covers them all. |
