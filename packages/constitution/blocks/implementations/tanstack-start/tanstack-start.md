---
id: tanstack-start
summary: The TanStack app shell — SPA mode, the document, prerendering.
requires: [tanstack-router]
extends: null
abstract: false
languages: []
governs: ["src/routes/__root.tsx", "src/router.ts", "src/router.tsx", "src/root/routes/__root.tsx", "src/root/router.ts", "src/root/router.tsx", "src/client.tsx"]
---

# TanStack Start

> **TanStack Start**, the application shell around the router, in SPA mode, served by Start's server or prerendered for a static host.

A function that runs on the server is declared by **`createServerFn`**, and Start's server is **Nitro**. Start has no `main` file: its entry files are the router's file, whose `getRouter` the framework calls, and `src/client.tsx` where the program hydrates itself — the entry file the other blocks name, where a polyfill loads — beside the root route, `__root.tsx`. The `tanstack-start` presets of the Constitution's distribution keep the entry files out of mutation and give them to the unused-code check as entries; on the architecture axis the root route stays out of mutation too. A project adds the entry files to its coverage exclusions.
