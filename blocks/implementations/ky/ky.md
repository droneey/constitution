---
id: ky
summary: ky, the HTTP client — one instance per system, errors mapped.
requires: [typescript, remote-data]
extends: null
abstract: false
checks: []
dictionary: [ky]
governs: ["**/providers/**", "**/adapters/**"]
---

# ky

> The HTTP client of the transport.

## Requirements

| Requirement | How in ky | Status |
|---|---|---|
| `remote-data-transport-timeout-and-cancel` | `timeout` per request, `signal` for cancellation | met |
| `remote-data-transport-typed-failures` | `HTTPError`, `TimeoutError`, and a `TypeError` for a network failure | met |
| `remote-data-transport-retries-only-transient` | `retry` by method, status and limit, with backoff | met |
