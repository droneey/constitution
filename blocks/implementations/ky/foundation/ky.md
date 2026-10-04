# ky

## ky-timeout-and-signal-kept → io-has-timeout-and-cancellation
ky's `timeout` stays on, and the caller's abort signal is passed through as `signal`.

| Why | Check | Tags |
|---|---|---|
| without the timeout a call waits for as long as the server keeps the connection open, and without the signal it runs on for a caller who left. | review | [performance] |

## ky-retries-kept-to-transient-failures → retry-only-transient-failures
ky's `retry` stays on its idempotent methods and transient statuses; no option adds a method that repeats a side effect or a status that will not change.

| Why | Check | Tags |
|---|---|---|
| ky's defaults already retry only what may succeed the next time, and each option widened loses that silently. | review | [performance] |

## ky-body-parsed-by-schema → response-body-parsed-never-cast
A response body is read as `unknown` and parsed by a schema; `.json<T>()` is a cast and is forbidden.

| Why | Check | Tags |
|---|---|---|
| `.json<T>()` only names a type and checks nothing. | tool/lint | [security] |

