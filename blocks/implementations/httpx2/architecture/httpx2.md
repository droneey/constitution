# httpx2

### one-client-per-system-built-by-the-root → one-transport-instance-per-system
`root/` builds one `AsyncClient` per remote system from the settings — base URL, headers, credentials, timeout — opens it for the program's lifespan, and passes it to the factories of that system's adapters; no adapter builds a client.

| Why | Tags |
|---|---|
| every adapter speaks to the system the same way, and a spec passes them a client over a mock transport. | [] |

### httpx2-errors-mapped-in-the-adapter → transport-failures-mapped-once
`HTTPStatusError`, `TimeoutException` and `TransportError` are mapped to domain errors in the adapter, through the shared mapper.

| Why | Tags |
|---|---|
| the domain handles its own errors, whatever client the transport uses. | [] |

### retries-written-in-the-adapter → httpx2-retries-kept-to-transient-failures
The adapter retries its calls, not the client.

| Why | Tags |
|---|---|
| the adapter knows which of its calls repeat safely, while the transport's own retries know no status, no backoff and no method. | [errors] |

### httpx2-only-at-the-edge → side-effects-at-the-edges
httpx2's home is the adapters, the client of a system under `libs/`, the mapper of its failures in `shared/` and `root/`, which builds the clients: no other folder imports it.

| Why | Tags |
|---|---|
| the network is an effect, and the code that reaches it is the code a spec replaces with a fake. | [] |
