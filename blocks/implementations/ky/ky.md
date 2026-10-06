---
id: ky
summary: ky, the HTTP client — one instance per system, errors mapped.
requires: [typescript, remote-service]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [ky]
governs: ["**/providers/**", "**/adapters/**"]
---

# ky

> The HTTP client of the transport.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `transport-timeout-and-cancel` | `timeout` per request, `signal` for cancellation | yes |
| `transport-typed-failures` | `HTTPError`, `TimeoutError`, and a `TypeError` for a network failure | yes |
| `transport-retries-only-transient` | `retry` by method, status and limit, with backoff | yes |
