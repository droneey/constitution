# TanStack Router

> **Vocabulary:** folder `routes`, the delivery layer of a browser application.

### screens-are-file-routes · SHOULD
Screens are file routes under `routes/`, the delivery layer, from which the router generates `routeTree.gen.ts`; `router.tsx` creates the router.

| Why | Tags |
|---|---|
| the file tree is the route tree, so a screen is found by its URL. | [] |

### routes-folder-holds-file-routes → screens-are-file-routes
`routes/` holds only file routes, their groups and parameters, and their dash folders.

| Why | Tags |
|---|---|
| the file tree is then the route tree. | [] |

### route-owns-its-url → screen-composes-the-page
A route owns its URL: it reads and validates its search, runs its loader, and composes the page.

| Why | Tags |
|---|---|
| the one place that knows the address is the one that turns it into data. | [] |

### router-primitives-only-in-screens-and-widgets → pieces-never-touch-navigation
The router's home is the route files, their private hooks in `-hooks/`, widgets, the router's own file and `root/`: no other folder imports it — no component, a screen's private ones in `-components/` included, no adapter and no code of `libs/`. A presentational component receives a link slot or a callback.

| Why | Tags |
|---|---|
| a presentational component that navigates works on one screen only, and what `libs/` or an adapter wraps knows nothing of the application's navigation. | [] |

### screen-private-pieces-in-dash-folders → screen-private-pieces-beside-screen
A screen's private pieces live beside its route in `-components/`, its private binding units in `-hooks/`, and the specs of both in the `__tests__/` of those folders, never in a `__tests__/` of the route folder.

| Why | Tags |
|---|---|
| the dash keeps them out of the route tree, and beside the screen they serve; the generator takes a `__tests__/` outside a dash folder for routes and warns on every run. | [] |

### screen-pieces-in-dash-folders → screen-private-pieces-in-dash-folders
A screen's private folders beside its route are `-components/` and `-hooks/`: `-components/` holds component folders and a surface, as `components/` does, and `-hooks/` holds hooks files and a surface.

| Why | Tags |
|---|---|
| the dash keeps them out of the route tree. | [] |

### document-head-declared-by-route → document-metadata-owned-by-screen
A route declares its document metadata in `head`.

| Why | Tags |
|---|---|
| the metadata changes with the route that owns it. | [ux] |

### route-pieces-reach-the-route-by-its-api → screen-private-pieces-beside-screen
A route's private binding units, in `-hooks/`, reach its params and search through `getRouteApi('<route id>')`, never by importing the route file; its private components, in `-components/`, take them as props.

| Why | Tags |
|---|---|
| a binding unit that imports its route file pulls the whole route into its module and ties the two into a cycle, and a component that reached the route would bind itself to data it should be given. | [] |

### routes-imported-by-no-inner-layer → dependencies-point-inward
Nothing under `features/`, `shared/`, `libs/`, `kernel/`, `contracts/` or `composition/` imports a file of `routes/`.

| Why | Tags |
|---|---|
| these are the layers the router's screens sit above. | [] |

### services-reach-loaders-through-router-context → one-explicit-composition-root
Every service the providers build — the adapters, the cache client, analytics, the configuration — reaches loaders and guards through the router's context.

| Why | Tags |
|---|---|
| a loader then reads through the same services as the screens, and a spec replaces them in one place. | [] |
