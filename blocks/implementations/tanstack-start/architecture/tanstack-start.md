# TanStack Start

## spa-mode-without-server-logic → server-rendering-is-delivery-only
The application runs in SPA mode: the root route renders on the client, and there is no server function, server route or data access, except the one configuration function below. Server rendering serves render speed only.

| Why | Check | Tags |
|---|---|---|
| a server tier with logic of its own is a second backend nobody designed. | review | [security] |

## runtime-config-from-one-server-function → runtime-configuration-served-beside-bundle
One server function reads the environment, parses it by a schema and serves it; the root route loads it once, before anything reads configuration.

| Why | Check | Tags |
|---|---|---|
| one bundle then serves every environment, and a missing setting fails at start. | review | [] |

## root-route-is-the-delivery-wiring → root-imported-only-by-entry-and-delivery-wiring
The root route is the delivery layer's wiring: it builds the shell — `<HeadContent/>`, `<Scripts/>`, the document's language — and mounts the providers of `root/`.

| Why | Check | Tags |
|---|---|---|
| the one route that may import the composition root is the one that mounts it. | review | [] |
