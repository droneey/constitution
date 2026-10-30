# Transport

> Governs who builds the clients and how they reach the adapters.

## General

### one-client-per-system-built-by-the-root → one-transport-instance-per-system · MUST

`root/` builds one `AsyncClient` per remote system from the settings — base URL, headers, credentials, timeout — and passes it to the factories of that system's adapters; no adapter builds a client.

| Why |
|---|
| every adapter speaks to the system the same way, and a spec passes them a client over a mock transport. |
