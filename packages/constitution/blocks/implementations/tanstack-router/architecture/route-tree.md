# Route tree

> Governs where routes are registered, how services reach loaders, where the router is imported, and who declares a route's document metadata.

## General

### routes-registered-in-the-root → delivery-unit-registered-by-the-root · MUST

Routes are file routes under `root/routes/`, from which the router generates its tree into `root/`, and `root/router.ts`, or `root/router.tsx` where it writes markup, creates the router. A route file registers one screen of composition and holds only what the router asks of it — its address and its schema, its loader and guard, its head, its pending and error components — and hands the screen its parameters, links and transitions; a layout route hands its screen `<Outlet/>` as a slot.

| Why |
|---|
| the file tree is the route tree, so a screen's registration is found by its URL; the one place that knows the address is the one that turns it into data, and the screen itself stays free of the router. |

### services-reach-loaders-through-router-context → composition-root-wires-everything · MUST

Every service the providers build — the use cases, the cache client, analytics, the configuration — reaches loaders and guards through the router's context.

| Why |
|---|
| a loader then reads through the same services as the screens, and a spec replaces them in one place. |

### router-primitives-only-in-the-root → ui-never-touches-navigation · MUST

`@tanstack/react-router` is imported in `root/` alone — by its routes, the router's file and the navigation the root hands down — and never by an adapter or code of `libs/`.

| Why |
|---|
| a change of the router or of a path then touches the root alone, and what `libs/` or an adapter wraps knows nothing of the application's navigation. |

### document-head-declared-by-route → document-metadata-owned-by-screen · SHOULD

A route declares its document metadata in `head`.

| Why |
|---|
| the metadata changes with the route that owns it. |
