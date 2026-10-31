# Calls

> Governs a call: its timeout, its retries and the fake a spec gives it.

## General

### ky-timeout-and-signal-kept → outside-call-has-a-timeout · MUST

ky's `timeout` stays on, and the caller's abort signal is passed through as `signal`.

| Why |
|---|
| without the timeout a call waits for as long as the server keeps the connection open, and without the signal it runs on for a caller who left. |

### ky-retries-kept-to-transient-failures → failure-retried-only-when-transient · MUST

ky's `retry` stays on its idempotent methods and transient statuses, with `jitter` on; no option adds a method that repeats a side effect or a status that will not change.

| Why |
|---|
| ky's defaults already retry only what may succeed the next time, and each option widened loses that silently. |

### ky-spec-fetch-refuses-unmatched → unmatched-request-fails-the-spec · MUST

A spec builds the ky instance with its `fetch` option set to a function that answers the requests the case expects and throws on any other, naming its method and URL; no spec replaces the global `fetch`.

| Why |
|---|
| the `fetch` option is the seam ky offers for a fake, while the unit sandbox makes the global `fetch` throw and unwritable. |
