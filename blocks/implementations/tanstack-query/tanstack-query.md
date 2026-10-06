---
id: tanstack-query
summary: Server data in the TanStack Query cache — keys, queries, mutations.
requires: [_react, remote-data, remote-service]
extends: null
abstract: false
languages: []
dictionary: [TanStack Query, QueryClient, useQuery, useSuspenseQuery, useMutation]
governs: ["**/*.hooks.ts", "**/root/providers/**", "**/cache.utils.ts"]
---

# TanStack Query

> The project's only cache of server data.

### query-for-reads-mutation-for-writes · SHOULD
A read goes through `useQuery`, or `useSuspenseQuery` where the read suspends, and a write through `useMutation`.

| Why | Tags |
|---|---|
| the cache then handles loading, deduplication and retries, which a hand-written request gets wrong. | [data] |

### query-result-returned-as-status-union → data-result-is-union-by-status
What wraps a query or a mutation returns Query's own result narrowed by its `status` — pending; error, with its typed error and, after a failed refetch, the data already shown; success, with its data. Or the read suspends — `useSuspenseQuery` — and the boundary above it handles the pending and failed states. The error type is registered once for the cache, and no default is invented.

| Why | Tags |
|---|---|
| consumers then handle states, not combinations of flags, and never mistake "not loaded" for "empty". | [data] |

### optimism-in-the-mutation-lifecycle → optimistic-lifecycle-safe-under-concurrency
Optimism lives in the mutation's lifecycle: `onMutate` cancels the reads in flight, snapshots, and writes values built by the program's own factories; `onError` restores; `onSettled` invalidates once the last mutation on the key settles; an item whose identifier the server assigns renders from the pending variables instead of a cache write. Never inside `mutationFn`.

| Why | Tags |
|---|---|
| this is the order that survives concurrent writes; any shortcut shows data the server refused, or loses another write's success. | [ux] |

### invalidation-in-on-settled · SHOULD
A write invalidates its keys in `onSettled`.

| Why | Tags |
|---|---|
| `onSettled` runs after success and failure alike, so the cache is refreshed either way. | [data] |

### query-retry-only-transient → failure-retried-only-when-transient
The client's `retry` is a predicate on the error's transience, with a limit — never the default three retries on every error; a mutation retries only when it is idempotent.

| Why | Tags |
|---|---|
| retrying a failure that will not change delays the error the user needs to see. | [] |

### query-signal-reaches-the-request → reads-cancellable-latest-wins
`queryFn` passes Query's abort signal to the operation it calls, down to the request, so a screen that is left cancels its read.

| Why | Tags |
|---|---|
| a read nobody waits for still costs the network and the server. | [] |

### input-query-keyed-on-debounced-value → input-driven-requests-debounced
A query driven by typing is keyed on the debounced or deferred value, and keeps the previous result as its placeholder.

| Why | Tags |
|---|---|
| a query per keystroke floods the server, and a blank list between keystrokes flickers. | [] |

### stream-folded-into-cache-per-frame → fast-source-updates-once-per-frame
A stream's events reach the cache in batches, with at most one cache write per frame.

| Why | Tags |
|---|---|
| a cache write per event redraws every subscriber on every event. | [data] |

### write-pending-until-its-refresh-lands · SHOULD
A mutation's `onSettled` returns the invalidation's promise, so the write stays pending until the fresh data lands.

| Why | Tags |
|---|---|
| a write that settles before its refresh shows the old data for a moment, as if it had failed. | [data] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `remote-data-cache-dedupes-by-key` | reads with one key share one query and one request | yes |
| `remote-data-cache-invalidates-by-prefix` | `invalidateQueries` by a key prefix, with or without a refetch | yes |
| `remote-data-cache-cancels-reads` | an abort signal per query, cancelled on unmount and by `cancelQueries` | yes |
| `remote-data-cache-mutation-lifecycle` | `onMutate`, `onError`, `onSettled` with a context; `useMutationState` reads pending variables | yes |
| `remote-data-cache-global-error-handler` | `onError` of `QueryCache` and `MutationCache` | yes |
| `remote-data-cache-staleness-policy` | `staleTime` and refetch options per query | yes |
