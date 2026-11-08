# Document

> Governs the root route that builds the document, and the router's entries.

## General

### root-route-builds-the-document → composition-root-assembles-the-program · MUST

The root route builds the document and mounts the root's providers. It renders `<Scripts/>` and mounts the providers of `root/`.

| Why |
|---|
| a document or a provider mounted outside the root is a concrete choice the root does not show, and a screen may run outside the providers it needs. |

### start-router-entries-point-into-the-root → routes-registered-in-the-root · MUST

The `tanstackStart()` plugin names `router.entry`, `router.routesDirectory` and `router.generatedRouteTree` under `root/`.

| Why |
|---|
| the plugin otherwise looks for the router and its routes at the top of the source, where the tree has no such folder, and finds no route to build. |
