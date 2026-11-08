# Queries

> Governs a read through the cache: its result, its error type, the key of an input, its abort signal and its retries.

## General

### query-result-returned-as-status-union → data-call-returns-a-union-of-its-states · MUST

Every wrapper of a query or a mutation returns Query's own result, a union keyed by its `status`. Exempt: a wrapper that suspends the read with `useSuspenseQuery`, which leaves its waiting and failed states to the boundary above it.

| Why |
|---|
| a result spread into flags lets a consumer meet combinations no state has and mistake "not loaded" for "empty" — make illegal states unrepresentable. |

### query-error-type-registered-once → fact-has-one-source · MUST

The cache's error type is registered once, as `defaultError` of Query's `Register` interface. No read declares an error type of its own.

| Why |
|---|
| an error type declared at each read drifts from what the cache's one failure handler receives, so a consumer branches on a type its error never has. |

## Inputs

### input-query-keyed-on-debounced-value → input-driven-requests-debounced · SHOULD

Every query driven by typing is keyed on the debounced value.

| Why |
|---|
| a query per keystroke floods the server. |

### input-query-keeps-its-previous-result → loading-never-replaces-shown-content · SHOULD

Every query driven by typing keeps its previous result as its placeholder, by `placeholderData: keepPreviousData`.

| Why |
|---|
| a blank list between keystrokes flickers, and the user loses the results they were reading. |

## Cancellation and retries

### query-signal-reaches-the-request → outside-call-can-be-cancelled · SHOULD

Every `queryFn` passes Query's abort signal to the operation it calls, down to the request. A screen that is left so cancels its read.

| Why |
|---|
| a read nobody waits for any more still costs the network and the server, and its answer reaches nobody. |

### query-retry-only-transient → failure-retried-only-when-transient · MUST

Every query, and every mutation that is idempotent, retries only transient failures, within a limit; no other mutation retries. The client's `retry` is a predicate on the error's transience with a limit, or `false` where the transport retries, never the default three retries on every error.

| Why |
|---|
| a retry of a failure that will not change delays the error the user needs to see, and a retry of a write that is not idempotent repeats its effect. |

### query-retry-off-where-the-transport-retries → failure-retried-at-one-level · MUST

Every client whose remote transport already retries sets Query's `retry` to `false`.

| Why |
|---|
| a second level of retries over the transport's multiplies its attempts, keeping a struggling system down. |

### query-retry-delay-spread-at-random → retry-waits-by-backoff-or-the-asked-delay · MUST

Every client that retries sets a `retryDelay` that spreads Query's exponential backoff at random.

| Why |
|---|
| Query's default delay doubles from one second up to thirty with no random spread (TanStack Query, retries guide), so the clients a failure hit retry all together and keep the server down. |
