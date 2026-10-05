---
id: httpx2
summary: httpx2, the HTTP client — one per system, a timeout on every call.
requires: [python, remote-service]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [httpx2]
governs: ["**/adapters/**", "**/root/**"]
---

# httpx2

> The HTTP client of the transport: an `httpx2.AsyncClient` per remote system, open for the program's life, with a timeout on every call.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `transport-timeout-and-cancel` | `timeout` on the client and on each call; a call is cancelled with the task or the cancel scope that awaits it | yes |
| `transport-typed-failures` | `HTTPStatusError` from `raise_for_status()`, `TimeoutException`, and `NetworkError` for a lost connection | yes |
| `transport-retries-only-transient` | the transport's `retries` repeats only a connection that failed to open, with no backoff; retries by failure, status and method are the program's own (`httpx2-retries-kept-to-transient-failures`) | partly |
