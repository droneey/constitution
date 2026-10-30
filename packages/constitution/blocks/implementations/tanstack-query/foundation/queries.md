# Queries

> Governs a read through the cache: its result, the key of an input, its abort signal and its retries.

## General

### query-result-returned-as-status-union → data-result-is-union-by-status · MUST

What wraps a query or a mutation returns Query's own result narrowed by its `status` — pending; error, with its typed error and, after a failed refetch, the data already shown; success, with its data. Or the read suspends — `useSuspenseQuery` — and the boundary above it handles the pending and failed states. The error type is registered once for the cache, and no default is invented.

| Why |
|---|
| consumers then handle states, not combinations of flags, and never mistake "not loaded" for "empty". |

## Inputs

### input-query-keyed-on-debounced-value → input-driven-requests-debounced · SHOULD

A query driven by typing is keyed on the debounced or deferred value, and keeps the previous result as its placeholder.

| Why |
|---|
| a query per keystroke floods the server, and a blank list between keystrokes flickers. |

## Cancellation and retries

### query-signal-reaches-the-request → outside-call-can-be-cancelled · SHOULD

`queryFn` passes Query's abort signal to the operation it calls, down to the request, so a screen that is left cancels its read.

| Why |
|---|
| a read nobody waits for still costs the network and the server. |

### query-retry-only-transient → failure-retried-only-when-transient · MUST

The client's `retry` is a predicate on the error's transience, with a limit — never the default three retries on every error — and `false` where the transport already retries; a mutation retries only when it is idempotent.

| Why |
|---|
| retrying a failure that will not change delays the error the user needs to see. |
