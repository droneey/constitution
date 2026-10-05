# ky

## one-ky-instance-per-system → one-transport-instance-per-system
One ky instance per remote system is built by the composition root from the configuration — prefix, credentials, headers — and passed to the adapters' factories; no adapter imports it or uses ky's default export.

| Why | Check | Tags |
|---|---|---|
| every adapter speaks to the system the same way, and a spec passes another instance. | review | [] |

## ky-errors-mapped-in-the-adapter → transport-failures-mapped-once · MUST
`HTTPError`, `TimeoutError` and network failures are mapped to domain errors in the adapter, through the shared mapper; nothing of ky crosses the adapter.

| Why | Check | Tags |
|---|---|---|
| the domain handles its own errors, whatever client the transport uses. | review | [] |
