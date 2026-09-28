# ky

## ky-timeout-retry-and-signal-kept → retry-only-transient-failures
ky's timeout stays on, its retries stay on idempotent methods and transient statuses, and the caller's abort signal is passed through.

| Why | Check | Tags |
|---|---|---|
| each default protects a rule of the transport; turning one off loses it silently. | review | [performance] |

## ky-body-parsed-by-schema → no-unchecked-escape-hatches
A response body is read as `unknown` and parsed by a schema; `.json<T>()` is a cast and is forbidden.

| Why | Check | Tags |
|---|---|---|
| a typed `.json<T>()` trusts the server with the program's types, and the first unexpected field breaks code far away. | tool — lint | [security] |
