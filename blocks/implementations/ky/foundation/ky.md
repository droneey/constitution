# ky

### ky-timeout-and-signal-kept → io-has-timeout-and-cancellation · MUST
ky's `timeout` stays on, and the caller's abort signal is passed through as `signal`.

| Why | Tags |
|---|---|
| without the timeout a call waits for as long as the server keeps the connection open, and without the signal it runs on for a caller who left. | [performance] |

### ky-retries-kept-to-transient-failures → retry-only-transient-failures
ky's `retry` stays on its idempotent methods and transient statuses; no option adds a method that repeats a side effect or a status that will not change.

| Why | Tags |
|---|---|
| ky's defaults already retry only what may succeed the next time, and each option widened loses that silently. | [performance] |

### ky-body-parsed-by-schema → boundary-values-unknown-until-parsed
A response body is read by `.json()` with no type argument and parsed by a schema; `.json<T>()` is forbidden.

| Why | Tags |
|---|---|
| `.json<T>()` only names a type and checks nothing. | [security] |
