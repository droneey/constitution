# TanStack Start

### spa-mode-renders-on-the-client · MUST

The application runs in SPA mode: the root route renders on the client, and the shell Start prerenders only speeds the first paint.

| Why | Tags |
|---|---|
| the program renders in the tab alone, so one build serves from a static host or from Start's server alike. | [] |

### root-route-builds-the-document → composition-root-wires-everything · MUST

The root route, in `root/routes/`, builds the document — `<HeadContent/>`, `<Scripts/>`, the document's language — and mounts the providers of `root/`.

| Why | Tags |
|---|---|
| the document and the providers every screen runs inside are wired once, in the root, where every other concrete choice is made. | [] |

### start-router-entries-point-into-the-root → routes-registered-in-the-root · MUST

`tanstackStart()` names `router.entry`, `router.routesDirectory` and `router.generatedRouteTree` under `root/`.

| Why | Tags |
|---|---|
| the plugin otherwise looks for the router and its routes at the top of the source, where the tree has no such folder. | [] |
