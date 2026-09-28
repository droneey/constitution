# ky

## one-ky-instance-per-system · SHOULD
One ky instance per remote system is built by the composition root from the configuration — prefix, credentials, headers — and passed to the adapters' factories; no adapter imports it or uses ky's default export.
**Why:** every adapter speaks to the system the same way, and a spec passes another instance.
**Check:** review
**Implements:** `remote-data-transport-built-by-the-root`

## ky-errors-mapped-in-the-adapter · MUST
`HTTPError`, `TimeoutError` and network failures are mapped to domain errors in the adapter, through the shared mapper; nothing of ky crosses the adapter.
**Why:** the domain handles its own errors, whatever client the transport uses.
**Check:** review
**Tags:** errors
**Implements:** `transport-failures-mapped-once`
