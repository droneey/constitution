---
id: tanstack-query
kind: implementation
summary: Server data in the TanStack Query cache — keys, bindings, mutations.
chapters: []
requires: [_react, remote-data]
extends: null
abstract: false
checks: []
owns: [TanStack Query, QueryClient, useQuery, useMutation]
governs: ["**/*.hooks.ts", "**/root/providers/**", "**/cache.utils.ts"]
status: stable
---

# TanStack Query

> The project's only cache of server data.

## bindings-wrap-query-and-mutation · SHOULD
A read's binding unit wraps `useQuery`, a write's `useMutation`; `queryFn` and `mutationFn` call the adapter the providers hand to the binding unit.
**Why:** the cache handles loading, deduplication and retries, and the adapter stays the composition root's choice.
**Check:** review
**Tags:** architecture
**Implements:** `binding-unit-composes-its-operation`

## query-result-returned-as-status-union · MUST
The binding unit returns a union by `status` — pending; error, with its typed error; success, with its data. Query's flags are converted here, and no default is invented.
**Why:** consumers then handle states, not combinations of flags, and never mistake "not loaded" for "empty".
**Check:** review
**Tags:** types, data
**Implements:** `binding-unit-result-is-union-by-status`

## keys-only-from-the-feature-factory · MUST
Every key comes from the feature's key factory in `app/utils/cache.utils.ts`, built from the port's parameters; no key array is written inline.
**Why:** an inline key drifts from the factory's, and an invalidation misses it.
**Check:** tool — lint
**Tags:** data
**Implements:** `cache-keys-from-feature-factory`

## cache-is-the-only-home-of-server-data · MUST
Server data lives only in the cache: never copied into state, a context or a store.
**Why:** a copy stops updating when the cache does, and the screen shows the copy.
**Check:** review
**Tags:** data
**Implements:** `server-owns-remote-data`

## invalidation-in-on-settled · SHOULD
A write invalidates its own feature's keys, in `onSettled`; a refresh across features is composed above, or left to staleness.
**Why:** `onSettled` runs after success and failure alike, so the cache is refreshed either way.
**Check:** review
**Tags:** data, architecture
**Implements:** `command-invalidates-in-its-binding-unit`

## optimism-in-the-mutation-lifecycle · MUST
Optimism lives in the mutation's lifecycle: `onMutate` cancels the reads in flight, snapshots, and writes with domain factories; `onError` restores; `onSettled` invalidates once the last mutation on the key settles; an item whose identifier the server assigns renders from the pending variables instead of a cache write. Never inside `mutationFn`.
**Why:** this is the order that survives concurrent writes; any shortcut shows data the server refused, or loses another write's success.
**Check:** review
**Tags:** data, ux
**Implements:** `optimistic-lifecycle-safe-under-concurrency`

## unauthorized-handled-once-in-the-cache · SHOULD
`onError` of the `QueryCache` and the `MutationCache`, set where the providers build the client, turns an unauthorized error into session state through the auth feature's surface, once.
**Why:** an expired session is handled the same way for every read and write.
**Check:** review
**Tags:** errors, security
**Implements:** `unauthorized-handled-once-in-cache`

## query-retry-only-transient · SHOULD
The client's `retry` is a predicate on the error's transience, with a limit — never the default three retries on every error; a mutation retries only when it is idempotent.
**Why:** retrying a failure that will not change delays the error the user needs to see.
**Check:** review
**Tags:** errors
**Implements:** `retry-only-transient-failures`

## query-signal-reaches-the-port · SHOULD
`queryFn` passes Query's abort signal to the port, so a screen that is left cancels its read.
**Why:** a read nobody waits for still costs the network and the server.
**Check:** review
**Tags:** performance
**Implements:** `reads-cancellable-latest-wins`

## stream-folded-into-cache-per-frame · SHOULD
A stream is folded into the cache with the domain's reducer, in batches of at most one per frame.
**Why:** a cache write per event redraws every subscriber on every event.
**Check:** review
**Tags:** performance, data
**Implements:** `stream-folded-by-domain-reducer`

## input-query-keyed-on-debounced-value · SHOULD
A query driven by typing is keyed on the debounced or deferred value, and keeps the previous result as its placeholder.
**Why:** a query per keystroke floods the server, and a blank list between keystrokes flickers.
**Check:** review
**Tags:** performance, ux
**Implements:** `input-driven-requests-debounced`

## query-client-built-once-fresh-per-spec · SHOULD
One `QueryClient` is built where the providers build the rest; each spec builds a fresh client with retries off, inside the providers, with the transport replaced by captured responses.
**Why:** a client shared between specs leaks one case's cache into the next.
**Check:** review
**Tags:** testing, architecture
**Implements:** `ui-specs-replace-the-transport`

## Requirements

| Requirement | How in TanStack Query | Status |
|---|---|---|
| `remote-data-cache-dedupes-by-key` | reads with one key share one query and one request | met |
| `remote-data-cache-invalidates-by-prefix` | `invalidateQueries` by a key prefix, with or without a refetch | met |
| `remote-data-cache-cancels-reads` | an abort signal per query, cancelled on unmount and by `cancelQueries` | met |
| `remote-data-cache-mutation-lifecycle` | `onMutate`, `onError`, `onSettled` with a context; `useMutationState` reads pending variables | met |
| `remote-data-cache-global-error-hook` | `onError` of `QueryCache` and `MutationCache` | met |
| `remote-data-cache-staleness-policy` | `staleTime` and refetch options per query | met |
