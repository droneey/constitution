# TanStack Query

## bindings-wrap-query-and-mutation · SHOULD
A read's binding unit wraps `useQuery`, and a write's wraps `useMutation`.
**Why:** the cache then handles loading, deduplication and retries, which a hand-written request gets wrong.
**Check:** review
**Tags:** data

## keys-only-from-the-feature-factory · MUST
No key array is written inline; every key comes from the key factory, built from the port's parameters.
**Why:** an inline key drifts from the factory's, and an invalidation misses it.
**Check:** tool — lint
**Tags:** data

## query-result-returned-as-status-union · MUST
The binding unit returns a union by `status` — pending; error, with its typed error; success, with its data. Query's flags are converted here, and no default is invented.
**Why:** consumers then handle states, not combinations of flags, and never mistake "not loaded" for "empty".
**Check:** review
**Tags:** types, data
**Implements:** `binding-unit-result-is-union-by-status`

## optimism-in-the-mutation-lifecycle · MUST
Optimism lives in the mutation's lifecycle: `onMutate` cancels the reads in flight, snapshots, and writes with domain factories; `onError` restores; `onSettled` invalidates once the last mutation on the key settles; an item whose identifier the server assigns renders from the pending variables instead of a cache write. Never inside `mutationFn`.
**Why:** this is the order that survives concurrent writes; any shortcut shows data the server refused, or loses another write's success.
**Check:** review
**Tags:** data, ux
**Implements:** `optimistic-lifecycle-safe-under-concurrency`

## invalidation-in-on-settled · SHOULD
A write invalidates its keys in `onSettled`.
**Why:** `onSettled` runs after success and failure alike, so the cache is refreshed either way.
**Check:** review
**Tags:** data

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

## input-query-keyed-on-debounced-value · SHOULD
A query driven by typing is keyed on the debounced or deferred value, and keeps the previous result as its placeholder.
**Why:** a query per keystroke floods the server, and a blank list between keystrokes flickers.
**Check:** review
**Tags:** performance, ux
**Implements:** `input-driven-requests-debounced`

## stream-folded-into-cache-per-frame · SHOULD
A stream's events reach the cache in batches, with at most one cache write per frame.
**Why:** a cache write per event redraws every subscriber on every event.
**Check:** review
**Tags:** performance, data
**Implements:** `fast-source-updates-once-per-frame`
