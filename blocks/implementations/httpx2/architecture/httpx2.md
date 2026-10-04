# httpx2

## one-client-per-system-built-by-the-root → remote-data-transport-built-by-the-root
`root/` builds one `AsyncClient` per remote system from the settings — base URL, headers, credentials, timeout — opens it for the program's lifespan, and passes it to the factories of that system's adapters; no adapter builds a client.

| Why | Check | Tags |
|---|---|---|
| every adapter speaks to the system the same way, and a spec passes them a client over a mock transport. | review | [] |

## httpx2-errors-mapped-in-the-adapter → transport-failures-mapped-once · MUST
`HTTPStatusError`, `TimeoutException` and `TransportError` are mapped to domain errors in the adapter, through the shared mapper; nothing of httpx2 crosses the adapter.

| Why | Check | Tags |
|---|---|---|
| the domain handles its own errors, whatever client the transport uses. | review | [] |

## retries-written-in-the-adapter → retry-only-transient-failures
The adapter retries a call, not the client: a timeout, a lost connection, a `429` or a `503` — after the `Retry-After` the answer gives — with backoff and a limit, and only for a call that repeats safely.

| Why | Check | Tags |
|---|---|---|
| the adapter knows which of its calls repeat safely, while the transport's own retries know no status, no backoff and no method. | review | [errors] |

## httpx2-only-at-the-edge → side-effects-at-the-edges
httpx2 is imported only by adapters, by the client of a system under `libs/`, by the shared mapper of its failures and by `root/`, which builds the clients.

| Why | Check | Tags |
|---|---|---|
| the network is an effect, and the code that reaches it is the code a spec replaces with a fake. | review | [] |
