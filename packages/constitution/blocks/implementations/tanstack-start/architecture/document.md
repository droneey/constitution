# Document

> Governs where the program renders, the root route that builds the document, and the router's entries.

## General

### spa-mode-renders-on-the-client · MUST

The program runs in SPA mode. The root route renders on the client, and the shell Start prerenders only speeds the first paint.

| Why |
|---|
| a program that renders on the server needs Start's server to serve it, so the build can no longer be served from a static host. |

### root-route-builds-the-document → composition-root-assembles-the-program · MUST

The root route builds the document and mounts the root's providers. It sits in `root/routes/`, renders `<HeadContent/>`, `<Scripts/>` and the document's language, and mounts the providers of `root/`.

| Why |
|---|
| a document or a provider mounted outside the root is a concrete choice the root does not show, and a screen may run outside the providers it needs. |

### start-router-entries-point-into-the-root → routes-registered-in-the-root · MUST

`tanstackStart()` names `router.entry`, `router.routesDirectory` and `router.generatedRouteTree` under `root/`.

| Why |
|---|
| the plugin otherwise looks for the router and its routes at the top of the source, where the tree has no such folder, and finds no route to build. |
