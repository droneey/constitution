# Calls

> Governs a call: its timeout, its client, its retries, and the transport a spec gives the client.

## General

### timeout-on-every-client-and-call → outside-call-has-a-timeout · MUST

Every client is built with its own `httpx2.Timeout`, and a call that needs another passes `timeout=`; no client and no call passes `timeout=None`.

| Why |
|---|
| the default of five seconds is nobody's choice for a given system, and `None` lets a call hang for as long as the server keeps the connection open. |

### client-open-for-the-program-life → resource-released-on-every-path · MUST

A client is opened once, with `async with`, for as long as the program runs, and closed with it; no call opens a client of its own — `httpx2.get` and the other functions of the module included — and no client is left unclosed.

| Why |
|---|
| a client pools its connections, so a client per call pays for a new connection and handshake each time, and one never closed leaks its sockets. |

### httpx2-transport-retries-off → failure-retried-only-when-transient · MUST

The transport's `retries` stays off; the calling code retries a timeout, a lost connection, a `429` or a `503` after the `Retry-After` the answer gives, with backoff and a limit.

| Why |
|---|
| httpx2's transport repeats only a connection that failed to open, with no backoff and blind to the status and the method, while the calling code knows which of its calls repeat safely. |

### mock-transport-refuses-unmatched → unmatched-request-fails-the-spec · MUST

A spec gives the client an `httpx2.MockTransport` whose handler answers the requests the case expects and raises on any other, naming its method and URL; no library patches httpx2.

| Why |
|---|
| the transport is the seam the client offers for a fake, while a patch replaces the library the spec claims to exercise. |
