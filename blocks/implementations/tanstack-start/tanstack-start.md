---
id: tanstack-start
summary: The TanStack app shell — SPA mode, root shell, runtime configuration.
requires: [tanstack-router]
extends: null
abstract: false
languages: []
dictionary: [TanStack Start, createServerFn, Nitro]
governs: ["src/routes/__root.tsx", "src/router.tsx"]
---

# TanStack Start

> The application shell around the router, in SPA mode. It has no `main` file: its entry files are `src/router.tsx`, whose `getRouter` the framework calls, and `src/client.tsx` where the program hydrates itself — the entry file the other blocks name, where a polyfill loads — beside the root route, `src/routes/__root.tsx`. The archive's `tanstack-start` parts keep the entry files out of mutation and give them to the unused-code check as entries; on the architecture axis the root route stays out of mutation too. A project adds the entry files to its coverage exclusions.
