# Adapters

> Governs where ky is imported, who builds the ky instances, and where an adapter maps ky's failures.

## General

### ky-home-is-the-adapters-libs-root-and-its-failure-mapper → layer-imports-dependencies-by-its-role · MUST

ky's home is the adapters, the client of a system under `libs/`, the mapper of its failures in `shared/` and `root/`, which builds the instances: no other folder imports it.

| Why | Tags |
|---|---|
| the network is an effect, and the code that reaches it is the code a spec replaces with a fake; the mapper turns ky's failures into the program's own in one place every adapter shares. | [] |

### one-ky-instance-per-system → one-transport-instance-per-system · MUST

One ky instance per remote system is built by the composition root from the configuration — prefix, credentials, headers — and passed to the adapters' factories; no adapter builds an instance or uses ky's default export.

| Why | Tags |
|---|---|
| every adapter speaks to the system the same way, and a spec passes another instance. | [] |

### ky-errors-mapped-in-the-adapter → transport-failures-mapped-once · MUST

`HTTPError`, `TimeoutError` and network failures are mapped to domain errors in the adapter, through the shared mapper.

| Why | Tags |
|---|---|
| the domain handles its own errors, whatever client the transport uses. | [] |
