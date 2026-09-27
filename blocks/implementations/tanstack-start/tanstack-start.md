---
id: tanstack-start
kind: implementation
summary: The TanStack app shell — SPA mode, root shell, runtime configuration.
chapters: []
requires: []
extends: tanstack-router
abstract: false
checks: []
owns: [TanStack Start, createServerFn, Nitro]
governs: ["src/routes/__root.tsx", "src/router.tsx"]
status: stable
---

# TanStack Start

> The application shell around the router, in SPA mode.

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

## hashed-assets-immutable-html-revalidated · SHOULD
Hashed assets are served as immutable; the HTML, the runtime configuration and the embed entries are revalidated.
**Why:** hashed files never change, so they are cached for good, while what points at them must be fresh.
**Check:** review
**Tags:** performance
