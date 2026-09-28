---
id: tanstack-router
kind: implementation
summary: File routes as screens — URL state, layouts, guards and links.
chapters: []
requires: [react-dom]
extends: null
abstract: false
checks: []
owns: [TanStack Router, routeTree.gen.ts]
governs: ["src/routes/**", "src/router.tsx"]
status: stable
---

# TanStack Router

> The project's only router. **Vocabulary:** folder `routes`, the delivery layer of a browser application. `router.tsx` is a name the framework fixes.

## screens-are-file-routes · SHOULD
Screens are file routes under `routes/`; `routeTree.gen.ts` is generated and never edited; `router.tsx` creates the router.
**Why:** the file tree is the route tree, so a screen is found by its URL.
**Check:** tool — names
**Tags:** architecture, naming
**Implements:** `generated-files-marked-never-edited`

## route-owns-its-url · SHOULD
A route owns its URL: it reads and validates its search, runs its loader, and composes the page.
**Why:** the one place that knows the address is the one that turns it into data.
**Check:** review
**Tags:** architecture
**Implements:** `screen-composes-the-page`

## router-primitives-only-in-screens-and-widgets · MUST
Router primitives — `Link`, `useNavigate`, `useSearch`, `useParams` — are imported only by route files, their private hooks and widgets. A presentational component receives a link slot or a callback.
**Why:** a presentational component that navigates works on one screen only.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `pieces-never-touch-navigation`

## search-params-validated-by-schema · MUST
Every route with search parameters validates them by a schema in `validateSearch`.
**Why:** the URL is input anyone can type, and an unvalidated parameter reaches the screen as whatever was typed.
**Check:** review
**Tags:** security, types
**Implements:** `untrusted-input-parsed-at-edge`

## search-params-merged-on-write · SHOULD
A write to the search merges with the current parameters, never replaces them.
**Why:** a screen that changes its page must keep the filter another piece set.
**Check:** review
**Tags:** ux
**Implements:** `url-holds-shareable-view-state`

## screen-private-pieces-in-dash-folders · SHOULD
A screen's private pieces live beside its route in `-components/`, its private binding units in `-hooks/`, and the specs of both in the `__tests__/` of those folders, never in a `__tests__/` of the route folder.
**Why:** the dash keeps them out of the route tree, and beside the screen they serve; the generator takes a `__tests__/` outside a dash folder for routes and warns on every run.
**Check:** tool — names
**Tags:** architecture, naming
**Implements:** `screen-private-pieces-beside-screen`

## layout-lives-in-route-file · MUST
A layout is a pathless `_name/route.tsx` that renders `<Outlet/>`, never an `index.tsx`.
**Why:** an `index.tsx` is a leaf route, and a layout placed there renders nothing below it.
**Check:** review
**Tags:** architecture

## guards-in-before-load · SHOULD
Access control sits in `beforeLoad`, through a feature's composition outside React, and ends in `redirect`.
**Why:** the guard runs before the screen loads anything, so a denied user sees nothing of it.
**Check:** review
**Tags:** security
**Implements:** `access-denied-unless-granted`

## error-component-per-route · SHOULD
Each route that loads data declares its error component; the root declares the not-found one.
**Why:** a failed loader then costs its route, with its own message, not the whole application.
**Check:** review
**Tags:** errors, ux
**Implements:** `error-boundary-per-screen`

## document-head-declared-by-route · SHOULD
A route declares its document metadata in `head`, and the root renders `<HeadContent/>`.
**Why:** the metadata changes with the route that owns it.
**Check:** review
**Tags:** ux
**Implements:** `document-metadata-owned-by-screen`
