---
id: ky
kind: implementation
summary: ky, the HTTP client — one instance per system, errors mapped.
chapters: []
requires: [typescript, remote-data]
extends: null
abstract: false
checks: []
owns: [ky]
governs: ["**/providers/**", "**/adapters/**"]
status: stable
---

# ky

> The HTTP client of the transport.

## one-ky-instance-per-system · SHOULD
One ky instance per remote system is built by the composition root from the configuration — prefix, credentials, headers — and passed to the adapters' factories; no adapter imports it or uses ky's default export.
**Why:** every adapter speaks to the system the same way, and a spec passes another instance.
**Check:** review
**Tags:** architecture
**Implements:** `remote-data-transport-built-by-the-root`

## ky-body-parsed-by-schema · MUST
A response body is read as `unknown` and parsed by the adapter's model schema; `.json<T>()` is a cast and is forbidden.
**Why:** a typed `.json<T>()` trusts the server with the program's types, and the first unexpected field breaks code far away.
**Check:** tool — lint
**Tags:** types, security
**Implements:** `responses-parsed-in-the-adapter`

## ky-errors-mapped-in-the-adapter · MUST
`HTTPError`, `TimeoutError` and network failures are mapped to domain errors in the adapter, through the shared mapper; nothing of ky crosses the adapter.
**Why:** the domain handles its own errors, whatever client the transport uses.
**Check:** review
**Tags:** errors
**Implements:** `transport-failures-mapped-once`

## ky-timeout-retry-and-signal-kept · SHOULD
ky's timeout stays on, its retries stay on idempotent methods and transient statuses, and the caller's abort signal is passed through.
**Why:** each default protects a rule of the transport; turning one off loses it silently.
**Check:** review
**Tags:** errors, performance
**Implements:** `retry-only-transient-failures`

## Requirements

| Requirement | How in ky | Status |
|---|---|---|
| `remote-data-transport-timeout-and-cancel` | `timeout` per request, `signal` for cancellation | met |
| `remote-data-transport-typed-failures` | `HTTPError`, `TimeoutError`, and a `TypeError` for a network failure | met |
| `remote-data-transport-retries-only-transient` | `retry` by method, status and limit, with backoff | met |
| `remote-data-transport-built-by-the-root` | `ky.create` builds a configured instance | met |
