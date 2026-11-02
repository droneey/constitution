# Queries

> Governs a read through the cache: its result, the key of an input, its abort signal and its retries.

## General

### query-result-returned-as-status-union → data-call-returns-a-union-of-its-states · MUST

A query's or a mutation's result is a union keyed by its `status`, or the read suspends. What wraps one returns Query's own result narrowed by its `status` — pending; error, with its typed error and, after a failed refetch, the data already shown; success, with its data — or the read suspends, with `useSuspenseQuery`, and the boundary above it handles the pending and failed states. The error type is registered once for the cache, and no default is invented.

| Why |
|---|
| a result spread into flags lets a consumer meet combinations no state has and mistake "not loaded" for "empty" — make illegal states unrepresentable. |

## Inputs

### input-query-keyed-on-debounced-value → input-driven-requests-debounced · SHOULD

A query driven by typing is keyed on the debounced or deferred value. It keeps the previous result as its placeholder.

| Why |
|---|
| a query per keystroke floods the server, and a blank list between keystrokes flickers. |

## Cancellation and retries

### query-signal-reaches-the-request → outside-call-can-be-cancelled · SHOULD

Query's abort signal reaches the request. `queryFn` passes it to the operation it calls, down to the request, so a screen that is left cancels its read.

| Why |
|---|
| a read nobody waits for any more still costs the network and the server, and its answer reaches nobody. |

### query-retry-only-transient → failure-retried-only-when-transient · MUST

Query retries only transient failures, within a limit. The client's `retry` is a predicate on the error's transience, with a limit — never the default three retries on every error — and `false` where the transport already retries; a mutation retries only when it is idempotent.

| Why |
|---|
| a retry of a failure that will not change delays the error the user needs to see, and a second level of retries over the transport's multiplies its attempts. |
