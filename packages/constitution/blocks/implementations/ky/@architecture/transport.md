# Transport

> Governs who builds the ky instances, how they reach the adapters, and the calls a saga retries itself.

## General

### one-ky-instance-per-system → one-transport-instance-per-system · MUST

Every remote system has one ky instance, built by the composition root. The root passes it to the adapters' factories; no adapter builds an instance or uses ky's default export.

| Why |
|---|
| an adapter that builds its own instance speaks to the system with an address, credentials and headers of its own, which drift from the others', and a spec cannot pass another instance in its place. |

### ky-retry-off-beneath-a-saga-step → saga-alone-retries-its-steps · MUST

Every ky call made for a saga's step or compensation sets `retry: 0`.

| Why |
|---|
| ky retries a failed call twice by default, so a call beneath a saga's step repeats under the saga's own retries and its attempts escape the saga's limit. |
