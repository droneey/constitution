---
id: tanstack-start
summary: The TanStack app shell — the document, its entries, its headers.
requires: [tanstack-router]
languages: []
governs: ["src/routes/**", "src/router.ts", "src/router.tsx", "src/root/routes/**", "src/root/router.ts", "src/root/router.tsx", "src/client.tsx", "src/start.ts"]
---

# TanStack Start

> TanStack Start, the program's shell around the router, served by Start's server or prerendered for a static host.

A function that runs on the server is declared by `createServerFn`. Start has no `main` file: its entry files are the router's file, whose `getRouter` the framework calls, and `src/client.tsx`, where the program hydrates itself and where a polyfill loads, beside the root route, `__root.tsx`.
