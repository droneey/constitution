# Transport

> Governs who builds the ky instances and how they reach the adapters.

## General

### one-ky-instance-per-system → one-transport-instance-per-system · MUST

Each remote system has one ky instance, built by the composition root. The root builds it from the configuration — prefix, credentials, headers — and passes it to the adapters' factories; no adapter builds an instance or uses ky's default export.

| Why |
|---|
| an adapter that builds its own instance speaks to the system with a prefix, credentials and headers of its own, which drift from the others', and a spec cannot pass another instance in its place. |
