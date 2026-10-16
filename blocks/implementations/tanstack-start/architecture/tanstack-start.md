# TanStack Start

### spa-mode-without-server-logic → rendering-server-only-delivers · MUST

The application runs in SPA mode: the root route renders on the client, and there is no server function, server route or data access, except the one server function that serves the tab's configuration and the session proxy the browser allows. Server rendering serves render speed only.

| Why | Tags |
|---|---|
| a server tier with logic of its own is a second backend nobody designed. | [security] |

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
