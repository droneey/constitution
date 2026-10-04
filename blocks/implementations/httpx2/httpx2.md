---
id: httpx2
summary: httpx2, the HTTP client — one per system, a timeout on every call.
requires: [python, remote-data]
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
| `remote-data-transport-timeout-and-cancel` | `timeout` on the client and on each call; a call is cancelled with the task or the cancel scope that awaits it | yes |
| `remote-data-transport-typed-failures` | `HTTPStatusError` from `raise_for_status()`, `TimeoutException`, and `NetworkError` for a lost connection | yes |
| `remote-data-transport-retries-only-transient` | the transport's `retries` repeats only a connection that failed to open, with no backoff; retries by method and status are the program's own | partly |
