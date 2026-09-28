# TanStack Router

## screens-are-file-routes · SHOULD
Screens are file routes under `routes/`, the delivery layer, from which the router generates `routeTree.gen.ts`; `router.tsx` creates the router.
**Why:** the file tree is the route tree, so a screen is found by its URL.
**Check:** tool — names
**Tags:** naming

## route-owns-its-url · SHOULD
A route owns its URL: it reads and validates its search, runs its loader, and composes the page.
**Why:** the one place that knows the address is the one that turns it into data.
**Check:** review
**Implements:** `screen-composes-the-page`

## router-primitives-only-in-screens-and-widgets · MUST
Router primitives — `Link`, `useNavigate`, `useSearch`, `useParams` — are imported only by route files, their private hooks and widgets. A presentational component receives a link slot or a callback.
**Why:** a presentational component that navigates works on one screen only.
**Check:** tool — architecture
**Implements:** `pieces-never-touch-navigation`

## search-params-validated-by-schema · MUST
Every route with search parameters validates them by a schema in `validateSearch`.
**Why:** the URL is input anyone can type, and an unvalidated parameter reaches the screen as whatever was typed.
**Check:** review
**Tags:** security, types
**Implements:** `untrusted-input-parsed-at-edge`

## search-params-merged-on-write · MUST
A write to the search merges with the current parameters, never replaces them.
**Why:** a screen that changes its page must keep the filter another piece set.
**Check:** review
**Tags:** ux
**Implements:** `url-holds-shareable-view-state`

## screen-private-pieces-in-dash-folders · SHOULD
A screen's private pieces live beside its route in `-components/`, its private binding units in `-hooks/`, and the specs of both in the `__tests__/` of those folders, never in a `__tests__/` of the route folder.
**Why:** the dash keeps them out of the route tree, and beside the screen they serve; the generator takes a `__tests__/` outside a dash folder for routes and warns on every run.
**Check:** tool — names
**Tags:** naming
**Implements:** `screen-private-pieces-beside-screen`

## guard-reaches-features-outside-react · MUST
A route's guard reaches the feature that decides access through the feature's composition outside React, never through the UI layer.
**Why:** `beforeLoad` runs before any component renders, so a guard that needs a hook or a component's context has nothing to read.
**Check:** review
**Implements:** `screen-guards-through-auth-surface`

## document-head-declared-by-route · SHOULD
A route declares its document metadata in `head`, and the root renders `<HeadContent/>`.
**Why:** the metadata changes with the route that owns it.
**Check:** review
**Tags:** ux
**Implements:** `document-metadata-owned-by-screen`
