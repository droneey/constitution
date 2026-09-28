# ky

## ky-timeout-retry-and-signal-kept · SHOULD
ky's timeout stays on, its retries stay on idempotent methods and transient statuses, and the caller's abort signal is passed through.
**Why:** each default protects a rule of the transport; turning one off loses it silently.
**Check:** review
**Tags:** errors, performance
**Implements:** `retry-only-transient-failures`
