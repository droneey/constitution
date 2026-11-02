# Routes

> Governs a route: its loader, its code splitting, its file and layout, what it shows when it fails or no route matches, and the head it claims.

The file routes live in **`routes/`**{#file-routes}.

## Loading

### screen-reads-start-in-the-loader · SHOULD

A screen's reads start in its route's loader. They start together, before the screen renders, never one after another as its components mount.

| Why |
|---|
| reads started in components wait for each other, mount after mount, so the screen paints late and fills in by steps; reads in a loader run in parallel and before the first paint. |

### routes-split-automatically · SHOULD

The router's bundler plugin splits every route's code automatically (`autoCodeSplitting: true`).

| Why |
|---|
| a split written by hand is forgotten on the next route, whose code then loads with every screen. |

## Files and layouts

### tanstack-router-file-names-kept → file-name-in-its-owners-case · MUST

A route file keeps the names TanStack Router builds its tree from. These are `__root.tsx`; a pathless layout `_<name>/route.tsx`; a group `(<name>)/`; a parameter `$<param>.tsx`; and a route that leaves its parent's layout, `<name>_.tsx`.

| Why |
|---|
| the router builds its tree from these names alone, so a file named otherwise is a different route or none, and the screen it was meant for is missing. |

### layout-lives-in-route-file · SHOULD

A layout lives in a pathless `_<name>/route.tsx` that renders `<Outlet/>`, never in an `index.tsx`.

| Why |
|---|
| an `index.tsx` is a leaf route, so a layout placed there renders nothing below it. |

## Failures

### not-found-declared-by-the-root → unknown-address-shows-the-not-found-screen · SHOULD

The root route declares the not-found component, which shows an address no route matches.

| Why |
|---|
| the router matches an address against its whole tree, so a not-found component declared below the root never sees an address no route takes, and the user meets the router's bare default. |

### error-component-per-route → failure-contained-to-its-screen · MUST

Each route that renders a screen declares its error component.

| Why |
|---|
| a route's error component is the boundary of its screen, so a failed loader costs its route, with its own message, not the whole program. |

## Head

### router-claims-the-head → one-writer-of-the-head · MUST

The router alone writes the head. The root renders `<HeadContent/>`, which renders the head's elements from the routes' `head`; no component renders `<title>`, `<meta>` or `<link>` itself.

| Why |
|---|
| the router changes the head with the route, so an element a component renders would fight it on every navigation. |
