---
id: tanstack-start
summary: The TanStack app shell — SPA mode, the document, runtime config.
requires: [tanstack-router, server]
extends: null
abstract: false
languages: []
dictionary: [TanStack Start, createServerFn, Nitro]
governs: ["src/routes/__root.tsx", "src/router.tsx", "src/root/routes/__root.tsx", "src/root/router.tsx", "src/client.tsx"]
---

# TanStack Start

> The application shell around the router, in SPA mode. It has no `main` file: its entry files are the router's file, whose `getRouter` the framework calls, and `src/client.tsx` where the program hydrates itself — the entry file the other blocks name, where a polyfill loads — beside the root route, `__root.tsx`. The archive's `tanstack-start` parts keep the entry files out of mutation and give them to the unused-code check as entries; on the architecture axis the root route stays out of mutation too. A project adds the entry files to its coverage exclusions.

### caching-set-where-the-files-are-served → hashed-file-immutable-and-its-pointers-revalidated · SHOULD

What serves the files sets the caching headers — Nitro's `routeRules` where Start's server serves them, the host's configuration file in the repository where a static host serves the SPA's shell and assets: `immutable` with a year's `max-age` on the hashed assets, and `no-cache` on the documents and the runtime configuration.

| Why | Tags |
|---|---|
| whatever serves the files then says how long each may be kept, in the same configuration as the program's other headers. | [performance] |

### content-security-policy-set-where-documents-are-served → document-served-with-a-strict-content-security-policy · MUST

What serves the documents sets the Content Security Policy on every one, beside the caching rules — Nitro's `routeRules` where Start's server serves them, the host's configuration file in the repository where a static host does — and the policy allows the shell's inline scripts by hash; a test reads the policy that is sent.

| Why | Tags |
|---|---|
| the policy then lives in the repository with the program, not in a proxy nobody here sees, and a test proves it is sent; Start's request middleware never reaches a shell a static host serves. | [security] |

### security-headers-set-where-documents-are-served · SHOULD

What serves the documents sets the other security headers on every one, as it sets the policy — `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Permissions-Policy` and `Reporting-Endpoints` — beside the Content Security Policy, and a test reads the headers that are sent.

| Why | Tags |
|---|---|
| one place for every header keeps them from drifting apart, and the test covers them all. | [security] |

### runtime-config-from-one-server-function → runtime-configuration-served-beside-bundle · MUST

One server function serves the public projection of the configuration parsed at start; the root route loads it once, before anything reads configuration.

| Why | Tags |
|---|---|
| one bundle then serves every environment, and a missing setting fails at start. | [] |
