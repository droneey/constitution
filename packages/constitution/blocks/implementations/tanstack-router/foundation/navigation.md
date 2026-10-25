# Navigation

> Governs a link, preloading and the focus after a navigation.

## General

### links-name-typed-targets · SHOULD

A link names its route by typed `to` and `params`, never a path built from strings; link data handed to another component is built with `linkOptions`.

| Why |
|---|
| a typed target fails the type check when the route moves; a built string fails in the user's hands. |

### routes-preload-on-intent · SHOULD

The router is created with `defaultPreload: 'intent'`, so hovering, focusing or touching a link starts its route's loader.

| Why |
|---|
| the data is on its way before the click; it costs a request for a link hovered and not followed. |

### focus-moved-when-a-navigation-resolves → navigation-moves-focus-to-the-view · MUST

The root route subscribes to the router's `onResolved` event and moves focus to the new view's main heading, unless only the view's search or parameters changed; the title comes from the route's `head`.

| Why |
|---|
| the router changes the view without touching focus, so the one place that sees every resolved navigation does it for all of them. |
