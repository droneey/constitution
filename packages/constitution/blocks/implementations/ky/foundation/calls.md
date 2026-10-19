# Calls

> Governs a call: its timeout and its retries.

## General

### ky-timeout-and-signal-kept → outside-call-has-a-timeout · MUST

ky's `timeout` stays on, and the caller's abort signal is passed through as `signal`.

| Why | Tags |
|---|---|
| without the timeout a call waits for as long as the server keeps the connection open, and without the signal it runs on for a caller who left. | [performance] |

### ky-retries-kept-to-transient-failures → failure-retried-only-when-transient · MUST

ky's `retry` stays on its idempotent methods and transient statuses, with `jitter` on; no option adds a method that repeats a side effect or a status that will not change.

| Why | Tags |
|---|---|
| ky's defaults already retry only what may succeed the next time, and each option widened loses that silently. | [performance] |
