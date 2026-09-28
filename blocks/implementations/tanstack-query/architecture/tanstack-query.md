# TanStack Query

## bindings-wrap-query-and-mutation · SHOULD
A read's binding unit wraps `useQuery`, a write's `useMutation`; `queryFn` and `mutationFn` call the adapter the providers hand to the binding unit.
**Why:** the cache handles loading, deduplication and retries, and the adapter stays the composition root's choice.
**Check:** review
**Tags:** architecture
**Implements:** `binding-unit-composes-its-operation`

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

## unauthorized-handled-once-in-the-cache · SHOULD
`onError` of the `QueryCache` and the `MutationCache`, set where the providers build the client, turns an unauthorized error into session state through the auth feature's surface, once.
**Why:** an expired session is handled the same way for every read and write.
**Check:** review
**Tags:** errors, security
**Implements:** `unauthorized-handled-once-in-cache`

## stream-folded-into-cache-per-frame · SHOULD
A stream is folded into the cache with the domain's reducer, in batches of at most one per frame.
**Why:** a cache write per event redraws every subscriber on every event.
**Check:** review
**Tags:** performance, data
**Implements:** `stream-folded-by-domain-reducer`

## query-client-built-once-fresh-per-spec · SHOULD
One `QueryClient` is built where the providers build the rest; each spec builds a fresh client with retries off, inside the providers, with the transport replaced by captured responses.
**Why:** a client shared between specs leaks one case's cache into the next.
**Check:** review
**Tags:** testing, architecture
**Implements:** `ui-specs-replace-the-transport`
