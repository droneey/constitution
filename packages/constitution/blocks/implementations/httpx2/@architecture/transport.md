# Transport

> Governs the client each remote system has, the calls that would open another, and who retries a call.

## General

### transport-instance-follows-the-programs-event-loop → one-transport-instance-per-system · MUST

Every remote system's transport instance is an `httpx2.AsyncClient` where the program runs an event loop, and an `httpx2.Client` where it runs none.

| Why |
|---|
| a synchronous client blocks the event loop on every call, while a program that runs no loop would start one only to call an asynchronous client. |

### call-opens-no-client-of-its-own → one-transport-instance-per-system · SHOULD

No call opens a client of its own, `httpx2.get` and the module's other functions included.

| Why |
|---|
| a client pools its connections, so a client per call pays for a new connection and handshake each time. |

### retries-written-in-the-adapter → failure-retried-only-when-transient · MUST

Outside a saga's step or compensation, every call's retries are written in its adapter, never set by `AsyncHTTPTransport(retries=…)` or `HTTPTransport(retries=…)`.

| Why |
|---|
| the transport's own retries know no status, no backoff and no method, and repeat at a second level beside the adapter's, while the adapter knows which of its calls repeat safely. |
