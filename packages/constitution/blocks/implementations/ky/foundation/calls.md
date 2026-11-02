# Calls

> Governs a call: its timeout, its retries and the fake a spec gives it.

## General

### ky-timeout-kept → outside-call-has-a-timeout · MUST

ky's `timeout` stays on.

| Why |
|---|
| without the timeout a call waits for as long as the server keeps the connection open. |

### ky-signal-kept → outside-call-can-be-cancelled · MUST

The caller's abort signal is passed through to ky as `signal`.

| Why |
|---|
| without the signal a call runs on for a caller who left. |

### ky-retries-kept-to-transient-failures → failure-retried-only-when-transient · MUST

ky retries only transient failures. Its `retry` stays on its idempotent methods and transient statuses, with `jitter` on; no option adds a method that repeats a side effect or a status that will not change.

| Why |
|---|
| ky's defaults already retry only what may succeed the next time, so an option that widens them repeats a side effect or waits on a failure that will not change, and does so in silence. |

### ky-spec-fetch-refuses-unmatched → unmatched-request-fails-the-spec · MUST

A spec fakes ky through its `fetch` option, which refuses every request the case does not expect. The function it passes answers the requests the case expects and throws on any other, naming its method and URL; no spec replaces the global `fetch`.

| Why |
|---|
| the unit sandbox makes the global `fetch` throw and unwritable, so a spec that replaces it fails, and a fake that answers any request lets a wrong call pass; the `fetch` option is the seam ky offers for a fake. |
