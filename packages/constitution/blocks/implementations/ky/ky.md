---
id: ky
summary: ky, the HTTP client — one instance per system, errors mapped.
requires: [typescript, remote-service]
extends: null
abstract: false
languages: []
governs: ["**/providers/**", "**/infrastructure/**"]
---

# ky

> **`ky`**, the HTTP client of the transport.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `transport-sets-a-timeout-and-cancels` | `timeout` per request, `signal` for cancellation | yes |
| `transport-tells-failures-apart` | `HTTPError`, `TimeoutError`, and a `TypeError` for a network failure | yes |
| `failure-retried-only-when-transient` | `retry` by method, status and limit, with backoff | yes |
