# Transport

> Governs who builds the clients, how they reach the adapters, and who retries a call.

## General

### one-client-per-system-built-by-the-root → one-transport-instance-per-system · MUST

`root/` builds one `AsyncClient` per remote system. It builds it from the settings — base URL, headers, credentials, timeout — and passes it to the factories of that system's adapters; no adapter builds a client.

| Why |
|---|
| adapters that build their own clients speak to one system in as many ways as there are adapters, each with a pool of its own, and leave a spec no place to pass a client over a mock transport. |

### retries-written-in-the-adapter → failure-retried-only-when-transient · MUST

The adapter retries its calls, never the client.

| Why |
|---|
| the transport's own retries know no status, no backoff and no method, and repeat at a second level beside the adapter's, while the adapter knows which of its calls repeat safely. |
