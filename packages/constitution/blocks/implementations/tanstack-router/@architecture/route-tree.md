# Route tree

> Governs where routes are registered, what a route file holds, how services reach loaders, where the router is imported, and who declares a route's document metadata.

## General

### routes-registered-in-the-root → delivery-unit-registered-by-the-root · MUST

Every route is a file route under `root/routes/`. The router generates its tree from them into `root/`, and `root/router.ts`, or `root/router.tsx` where it writes markup, creates the router.

| Why |
|---|
| a route registered elsewhere is not found by a reader who looks for a URL's screen in the root's file tree, and the root no longer lists everything the program answers. |

### route-file-holds-only-what-the-router-asks → fixed-registration-holds-only-the-handoff · SHOULD

Every route file holds only what the router asks of it. It registers one screen of the program's presentation: it holds the screen's address and its schema, takes its pending and error components from the surface of the screen's module, leaves what its loader and guard decide to binding units, and hands the screen its parameters, links, navigations and its error component's retry; a layout route hands its screen `<Outlet/>` as a slot.

| Why |
|---|
| a decision kept in a route file sits in the root, which no spec proves, and a screen that reaches the router itself renders only inside it; a route that only registers needs no spec, and what the router renders around the screen is proven with the screen's module — Humble Object. |

### services-reach-loaders-through-router-context → unit-handed-its-dependencies · MUST

Every service the providers build reaches loaders and guards through the router's context. Such services include the use cases and the configuration.

| Why |
|---|
| a loader that imports a service reaches another instance than the screens use, and a spec cannot replace it without patching the import; through the context, one place hands every service to both. |

### router-primitives-only-in-the-root → ui-never-touches-navigation · MUST

Only `root/` imports `@tanstack/react-router`. Its routes, the router's file and the navigation the root hands down import it, never an adapter or code of `libs/`, and a binding unit that answers the router, such as with `notFound`, takes that answer from the route that calls it.

| Why |
|---|
| code that imports the router outside the root changes with every change of the router or of a path, and a lib or an adapter that imports it knows the program's navigation; a binding unit handed `notFound` decides when the router answers it without depending on the router. |

### document-head-declared-by-route → document-metadata-owned-by-screen · MUST

Every screen's document metadata is declared in its route's `head`, which takes it from the surface of the screen's module.

| Why |
|---|
| the router reads the metadata only from the route, so metadata declared elsewhere never reaches the head, and metadata written in the route itself is kept apart from the screen whose content it describes, and drifts from it. |
