---
id: httpx2
summary: httpx2, the HTTP client — one per system, a timeout on every call.
requires: [python, remote-service]
extends: null
abstract: false
languages: []
dictionary: [httpx2]
governs: ["**/adapters/**", "**/root/**"]
---

# httpx2

> The HTTP client of the transport.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `transport-sets-a-timeout-and-cancels` | `timeout` on the client and on each call; a call is cancelled with the task or the cancel scope that awaits it | yes |
| `transport-tells-failures-apart` | `HTTPStatusError` from `raise_for_status()`, `TimeoutException`, and `NetworkError` for a lost connection | yes |
| `failure-retried-only-when-transient` | the transport's `retries` repeats only a connection that failed to open, with no backoff; retries by failure, status and method are the program's own (`httpx2-retries-kept-to-transient-failures`) | partly |
