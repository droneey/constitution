# TanStack Start

## spa-mode-without-server-logic · MUST
The application runs in SPA mode: the root route renders on the client, and there is no server function, server route or data access, except the one configuration function below. Server rendering serves render speed only.
**Why:** a server tier with logic of its own is a second backend nobody designed.
**Check:** review
**Tags:** architecture, security
**Implements:** `server-rendering-is-delivery-only`

## runtime-config-from-one-server-function · SHOULD
One server function reads the environment, parses it by a schema and serves it; the root route loads it once, before anything reads configuration.
**Why:** one bundle then serves every environment, and a missing setting fails at start.
**Check:** review
**Tags:** security, architecture
**Implements:** `runtime-configuration-served-beside-bundle`

## root-route-is-the-delivery-wiring · SHOULD
The root route is the delivery layer's wiring: it builds the shell — `<HeadContent/>`, `<Scripts/>`, the document's language — and mounts the providers of `root/`.
**Why:** the one route that may import the composition root is the one that mounts it.
**Check:** review
**Tags:** architecture
**Implements:** `root-imported-only-by-entry-and-delivery-wiring`
