# TanStack Query

## query-functions-call-the-handed-adapter · SHOULD
`queryFn` and `mutationFn` call the operation with the adapter the providers hand to the binding unit.
**Why:** the adapter stays the composition root's choice, and a spec hands in another.
**Check:** review
**Implements:** `binding-unit-composes-its-operation`

## key-factory-in-cache-utils · MUST
Each feature's key factory lives in its `app/utils/cache.utils.ts`.
**Why:** every binding unit of the feature takes its keys from one known module, so a read and the invalidation that refreshes it build the same key.
**Check:** review
**Implements:** `cache-keys-from-feature-factory`

## cache-is-the-only-home-of-server-data · MUST
Server data lives only in the cache: never copied into state, a context or a store.
**Why:** a copy stops updating when the cache does, and the screen shows the copy.
**Check:** review
**Tags:** data
**Implements:** `server-owns-remote-data`

## unauthorized-handled-once-in-the-cache · SHOULD
`onError` of the `QueryCache` and the `MutationCache`, set where the providers build the client, turns an unauthorized error into session state through the auth feature's surface, once.
**Why:** an expired session is handled the same way for every read and write.
**Check:** review
**Tags:** errors, security
**Implements:** `unauthorized-handled-once-in-cache`
