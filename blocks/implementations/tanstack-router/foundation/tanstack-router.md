# TanStack Router

### layout-lives-in-route-file · SHOULD
A layout is a pathless `_name/route.tsx` that renders `<Outlet/>`, never an `index.tsx`.

| Why | Tags |
|---|---|
| an `index.tsx` is a leaf route, and a layout placed there renders nothing below it. | [] |

### tanstack-router-file-names-kept → kebab-case-file-names
A route keeps the names TanStack Router builds its tree from: `__root.tsx`, a pathless layout `_auth.tsx`, a group `(shop)/`, a parameter `$orderId.tsx`, and a route that leaves its parent's layout, `posts_.tsx`.

| Why | Tags |
|---|---|
| the router builds its tree from these names alone. | [] |

### links-name-typed-targets · SHOULD
A link names its route by typed `to` and `params`, never a path built from strings; link data handed to another component is built with `linkOptions`.

| Why | Tags |
|---|---|
| a typed target fails the type check when the route moves; a built string fails in the user's hands. | [] |

### routes-preload-on-intent · SHOULD
The router is created with `defaultPreload: 'intent'`, so hovering, focusing or touching a link starts its route's loader.

| Why | Tags |
|---|---|
| the data is on its way before the click; it costs a request for a link hovered and not followed. | [] |

### screen-reads-start-in-the-loader · SHOULD
A screen's reads start together in its route's loader, before it renders, never one after another as its components mount.

| Why | Tags |
|---|---|
| reads started in a loader run in parallel and before the first paint; reads in components wait for each other. | [performance] |

### loader-declares-the-search-it-reads · SHOULD
A loader that reads search params declares them in `loaderDeps`.

| Why | Tags |
|---|---|
| the loader then reruns when they change, and its cache entry is keyed by them. | [] |

### routes-split-automatically · SHOULD
The router's bundler plugin splits every route's code automatically (`autoCodeSplitting: true`).

| Why | Tags |
|---|---|
| each screen then loads only its own code, with no split written by hand. | [] |

### router-claims-the-head → browser-resources-have-one-writer
The router claims the document's head: the root renders `<HeadContent/>`, and nothing else writes the head.

| Why | Tags |
|---|---|
| the router changes the head with the route, so a second writer would fight it on every navigation. | [] |

### search-params-validated-by-schema → address-parsed-as-untrusted-input
Every route with search parameters validates them by a schema in `validateSearch`.

| Why | Tags |
|---|---|
| the URL is input anyone can type, and an unvalidated parameter reaches the screen as whatever was typed. | [] |

### search-params-merged-on-write → address-write-keeps-the-other-parameters
A write to the search merges with the current parameters, never replaces them.

| Why | Tags |
|---|---|
| a screen that changes its page must keep the filter another piece set. | [] |

### search-falls-back-to-defaults · SHOULD
A route's search schema gives every param a default, so a malformed URL opens the screen with its defaults instead of an error.

| Why | Tags |
|---|---|
| a shared or old link still opens the screen. | [] |

### not-found-declared-by-the-root → unknown-address-shows-the-not-found-screen
The root route declares the not-found component, which shows an address no route matches.

| Why | Tags |
|---|---|
| the router matches an address against its whole tree, so only the root sees an address no route takes. | [ux] |

### error-component-per-route → failure-contained-to-its-screen
Each route that renders a screen declares its error component.

| Why | Tags |
|---|---|
| a route's error component is the boundary of its screen, so a failed loader costs its route, with its own message, not the whole application. | [errors, ux] |

## Accessibility

### focus-moved-when-a-navigation-resolves → navigation-moves-focus-to-the-view
The root route subscribes to the router's `onResolved` event and moves focus to the new view's main heading, unless only the view's search or parameters changed; the title comes from the route's `head`.

| Why | Tags |
|---|---|
| the router changes the view without touching focus, so the one place that sees every resolved navigation does it for all of them. | [a11y] |
