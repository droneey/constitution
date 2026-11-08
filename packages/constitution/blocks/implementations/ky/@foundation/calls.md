# Calls

> Governs a call: its timeout, its signal, its retries and the fake a spec gives it.

## General

### ky-timeout-kept → outside-call-has-a-timeout · MUST

Every ky call keeps its `timeout` on.

| Why |
|---|
| without the timeout a call waits for as long as the server keeps the connection open. |

### ky-signal-kept → outside-call-can-be-cancelled · SHOULD

Every ky call is given its caller's abort signal as `signal`.

| Why |
|---|
| without the signal a call runs on for a caller who left. |

### ky-retries-kept-to-transient-failures → failure-retried-only-when-transient · MUST

Every ky instance retries only transient failures. Its `retry` stays on idempotent methods and transient statuses, and no option, such as `methods`, `statusCodes`, `retryOnTimeout` or `shouldRetry`, adds a method that is not idempotent or a failure that is not transient.

| Why |
|---|
| ky's defaults already retry only what may succeed the next time, so an option that widens them repeats a side effect or waits on a failure that will not change, and does so in silence. |

### ky-retry-jitter-on → retry-waits-by-backoff-or-the-asked-delay · MUST

Every ky instance that retries sets `retry.jitter`, so its backoff is spread at random.

| Why |
|---|
| ky's backoff has no random spread unless `jitter` is set (ky's readme), so the clients a failure hit retry all together and keep the server down. |

### ky-spec-fetch-refuses-unmatched → unmatched-request-fails-the-spec · MUST

A spec fakes ky through its `fetch` option, which refuses every request the case does not expect. The function it passes answers the requests the case expects and throws on any other, naming its method and URL; no spec replaces the global `fetch`.

| Why |
|---|
| a fake that answers any request lets a wrong call pass, and a replaced global `fetch` reaches every other call of the spec's process; the `fetch` option is the seam ky offers for a fake. |
