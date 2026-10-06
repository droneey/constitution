---
id: ky
summary: ky, the HTTP client — one instance per system, errors mapped.
requires: [typescript, remote-service]
extends: null
abstract: false
languages: []
dictionary: [ky]
governs: ["**/providers/**", "**/adapters/**"]
---

# ky

> The HTTP client of the transport.

### ky-timeout-and-signal-kept → outside-call-has-a-timeout
ky's `timeout` stays on, and the caller's abort signal is passed through as `signal`.

| Why | Tags |
|---|---|
| without the timeout a call waits for as long as the server keeps the connection open, and without the signal it runs on for a caller who left. | [performance] |

### ky-retries-kept-to-transient-failures → failure-retried-only-when-transient
ky's `retry` stays on its idempotent methods and transient statuses; no option adds a method that repeats a side effect or a status that will not change.

| Why | Tags |
|---|---|
| ky's defaults already retry only what may succeed the next time, and each option widened loses that silently. | [performance] |

### ky-body-parsed-by-schema → boundary-values-unknown-until-parsed
A response body is read by `.json()` with no type argument and parsed by a schema; `.json<T>()` is forbidden.

| Why | Tags |
|---|---|
| `.json<T>()` only names a type and checks nothing. | [security] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `transport-timeout-and-cancel` | `timeout` per request, `signal` for cancellation | yes |
| `transport-typed-failures` | `HTTPError`, `TimeoutError`, and a `TypeError` for a network failure | yes |
| `transport-retries-only-transient` | `retry` by method, status and limit, with backoff | yes |
