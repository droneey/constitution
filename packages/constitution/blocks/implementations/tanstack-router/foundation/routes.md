# Routes

> Governs a route: its loader, its code splitting, its file and layout, what it shows when it fails or no route matches, and the head it claims.

The file routes live in **`routes/`**{#file-routes}.

## Loading

### screen-reads-start-in-the-loader · SHOULD

A screen's reads start together in its route's loader, before it renders, never one after another as its components mount.

| Why |
|---|
| reads started in a loader run in parallel and before the first paint; reads in components wait for each other. |

### routes-split-automatically · SHOULD

The router's bundler plugin splits every route's code automatically (`autoCodeSplitting: true`).

| Why |
|---|
| each screen then loads only its own code, with no split written by hand. |

## Files and layouts

### layout-lives-in-route-file · SHOULD

A layout is a pathless `_name/route.tsx` that renders `<Outlet/>`, never an `index.tsx`.

| Why |
|---|
| an `index.tsx` is a leaf route, and a layout placed there renders nothing below it. |

### tanstack-router-file-names-kept → file-name-in-its-owners-case · MUST

A route keeps the names TanStack Router builds its tree from: `__root.tsx`, a pathless layout `_auth/route.tsx`, a group `(shop)/`, a parameter `$orderId.tsx`, and a route that leaves its parent's layout, `posts_.tsx`.

| Why |
|---|
| the router builds its tree from these names alone. |

## Failures

### not-found-declared-by-the-root → unknown-address-shows-the-not-found-screen · SHOULD

The root route declares the not-found component, which shows an address no route matches.

| Why |
|---|
| the router matches an address against its whole tree, so only the root sees an address no route takes. |

### error-component-per-route → failure-contained-to-its-screen · MUST

Each route that renders a screen declares its error component.

| Why |
|---|
| a route's error component is the boundary of its screen, so a failed loader costs its route, with its own message, not the whole application. |

## Head

### router-claims-the-head → browser-resources-have-one-writer · MUST

The router claims the document's head: the root renders `<HeadContent/>`, and nothing else writes the head.

| Why |
|---|
| the router changes the head with the route, so a second writer would fight it on every navigation. |
