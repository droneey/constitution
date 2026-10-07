# TanStack Start

### spa-mode-without-server-logic → server-rendering-is-delivery-only · MUST
The application runs in SPA mode: the root route renders on the client, and there is no server function, server route or data access, except the one server function that serves the configuration (`runtime-config-from-one-server-function`) and the session proxy the browser allows. Server rendering serves render speed only.

| Why | Tags |
|---|---|
| a server tier with logic of its own is a second backend nobody designed. | [security] |

### root-route-is-the-delivery-wiring → root-imported-only-by-entries-and-delivery-wiring · MUST
The root route is the delivery layer's wiring: it builds the shell — `<HeadContent/>`, `<Scripts/>`, the document's language — and mounts the providers of `root/`.

| Why | Tags |
|---|---|
| the one route that may import the composition root is the one that mounts it. | [] |
