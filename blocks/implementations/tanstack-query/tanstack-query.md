---
id: tanstack-query
summary: Server data in the TanStack Query cache — keys, bindings, mutations.
requires: [_react, remote-data]
extends: null
abstract: false
checks: []
dictionary: [TanStack Query, QueryClient, useQuery, useMutation]
governs: ["**/*.hooks.ts", "**/root/providers/**", "**/cache.utils.ts"]
---

# TanStack Query

> The project's only cache of server data.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `remote-data-cache-dedupes-by-key` | reads with one key share one query and one request | yes |
| `remote-data-cache-invalidates-by-prefix` | `invalidateQueries` by a key prefix, with or without a refetch | yes |
| `remote-data-cache-cancels-reads` | an abort signal per query, cancelled on unmount and by `cancelQueries` | yes |
| `remote-data-cache-mutation-lifecycle` | `onMutate`, `onError`, `onSettled` with a context; `useMutationState` reads pending variables | yes |
| `remote-data-cache-global-error-hook` | `onError` of `QueryCache` and `MutationCache` | yes |
| `remote-data-cache-staleness-policy` | `staleTime` and refetch options per query | yes |
