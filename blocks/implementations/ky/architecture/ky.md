# ky

### one-ky-instance-per-system → one-transport-instance-per-system · MUST
One ky instance per remote system is built by the composition root from the configuration — prefix, credentials, headers — and passed to the adapters' factories; no adapter imports it or uses ky's default export.

| Why | Tags |
|---|---|
| every adapter speaks to the system the same way, and a spec passes another instance. | [] |

### ky-errors-mapped-in-the-adapter → transport-failures-mapped-once · MUST
`HTTPError`, `TimeoutError` and network failures are mapped to domain errors in the adapter, through the shared mapper.

| Why | Tags |
|---|---|
| the domain handles its own errors, whatever client the transport uses. | [] |

### ky-home-is-the-edge-and-its-failure-mapper → layer-imports-dependencies-by-its-role · MUST
ky's home is the edge and the mapper of its failures in `shared/`; no other folder imports it.

| Why | Tags |
|---|---|
| the mapper turns ky's failures into the program's own in one place every adapter shares, and nothing else needs the library. | [] |
