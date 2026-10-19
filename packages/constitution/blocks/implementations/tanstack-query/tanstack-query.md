---
id: tanstack-query
summary: Server data in the TanStack Query cache — keys, queries, mutations.
requires: [_react, remote-data]
extends: null
abstract: false
languages: []
dictionary: [TanStack Query, QueryClient, useQuery, useSuspenseQuery, useMutation]
governs: ["**/*.hooks.ts", "**/root/providers/**", "**/cache.utils.ts"]
---

# TanStack Query

> The project's only cache of server data.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `cache-shares-one-read-per-key` | reads with one key share one query and one request | yes |
| `cache-invalidates-by-key-prefix` | `invalidateQueries` by a key prefix, with or without a refetch | yes |
| `cache-undoes-only-the-failed-writes-change` | `onMutate` returns a snapshot that `onError` restores before reapplying the mutations still pending on the key, and `onSettled` invalidates | yes |
| `cache-exposes-the-input-of-pending-writes` | `useMutationState` reads the variables of pending writes | yes |
| `cache-passes-every-failure-to-one-handler` | `onError` of `QueryCache` and `MutationCache` | yes |
| `cache-sets-staleness-per-key` | `staleTime` and refetch options per query | yes |
