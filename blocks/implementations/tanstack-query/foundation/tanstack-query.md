# TanStack Query

## query-for-reads-mutation-for-writes · SHOULD
A read goes through `useQuery`, and a write through `useMutation`.

| Why | Check | Tags |
|---|---|---|
| the cache then handles loading, deduplication and retries, which a hand-written request gets wrong. | review | [data] |

## keys-only-from-the-key-factory · MUST
No key array is written inline; every key comes from the key factory, built from the parameters of the operation it caches.

| Why | Check | Tags |
|---|---|---|
| an inline key drifts from the factory's, and an invalidation misses it. | tool — lint | [data] |

## query-result-returned-as-status-union → data-result-is-union-by-status
What wraps a query or a mutation returns a union by `status` — pending; error, with its typed error; success, with its data. Query's flags are converted there, and no default is invented.

| Why | Check | Tags |
|---|---|---|
| consumers then handle states, not combinations of flags, and never mistake "not loaded" for "empty". | review | [data] |

## optimism-in-the-mutation-lifecycle → optimistic-lifecycle-safe-under-concurrency
Optimism lives in the mutation's lifecycle: `onMutate` cancels the reads in flight, snapshots, and writes with domain factories; `onError` restores; `onSettled` invalidates once the last mutation on the key settles; an item whose identifier the server assigns renders from the pending variables instead of a cache write. Never inside `mutationFn`.

| Why | Check | Tags |
|---|---|---|
| this is the order that survives concurrent writes; any shortcut shows data the server refused, or loses another write's success. | review | [ux] |

## invalidation-in-on-settled · SHOULD
A write invalidates its keys in `onSettled`.

| Why | Check | Tags |
|---|---|---|
| `onSettled` runs after success and failure alike, so the cache is refreshed either way. | review | [data] |

## query-retry-only-transient → retry-only-transient-failures
The client's `retry` is a predicate on the error's transience, with a limit — never the default three retries on every error; a mutation retries only when it is idempotent.

| Why | Check | Tags |
|---|---|---|
| retrying a failure that will not change delays the error the user needs to see. | review | [] |

## query-signal-reaches-the-request → reads-cancellable-latest-wins
`queryFn` passes Query's abort signal to the operation it calls, down to the request, so a screen that is left cancels its read.

| Why | Check | Tags |
|---|---|---|
| a read nobody waits for still costs the network and the server. | review | [] |

## input-query-keyed-on-debounced-value → input-driven-requests-debounced
A query driven by typing is keyed on the debounced or deferred value, and keeps the previous result as its placeholder.

| Why | Check | Tags |
|---|---|---|
| a query per keystroke floods the server, and a blank list between keystrokes flickers. | review | [] |

## stream-folded-into-cache-per-frame → fast-source-updates-once-per-frame
A stream's events reach the cache in batches, with at most one cache write per frame.

| Why | Check | Tags |
|---|---|---|
| a cache write per event redraws every subscriber on every event. | review | [data] |
