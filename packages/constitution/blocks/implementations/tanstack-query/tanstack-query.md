---
id: tanstack-query
summary: Server data in the TanStack Query cache — keys, queries, mutations.
requires: [react, integrations/remote-data]
languages: []
governs: ["**/*.hooks.ts", "**/root/**", "**/bindings/shared/cache.ts"]
---

# TanStack Query

> TanStack Query, the cache of server data.

One `QueryClient` holds the cache; a read goes through `useQuery` or `useSuspenseQuery`, and a write through `useMutation`.
