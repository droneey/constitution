# Transport

> Governs where ky is imported and who builds the ky instances.

## General

### one-ky-instance-per-system → one-transport-instance-per-system · MUST

One ky instance per remote system is built by the composition root from the configuration — prefix, credentials, headers — and passed to the adapters' factories; no adapter builds an instance or uses ky's default export.

| Why |
|---|
| every adapter speaks to the system the same way, and a spec passes another instance. |
