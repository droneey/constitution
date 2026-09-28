# ky

## ky-timeout-retry-and-signal-kept · SHOULD
ky's timeout stays on, its retries stay on idempotent methods and transient statuses, and the caller's abort signal is passed through.
**Why:** each default protects a rule of the transport; turning one off loses it silently.
**Check:** review
**Tags:** errors, performance
**Implements:** `retry-only-transient-failures`

## ky-body-parsed-by-schema · MUST
A response body is read as `unknown` and parsed by a schema; `.json<T>()` is a cast and is forbidden.
**Why:** a typed `.json<T>()` trusts the server with the program's types, and the first unexpected field breaks code far away.
**Check:** tool — lint
**Tags:** types, security
**Implements:** `no-unchecked-escape-hatches`
