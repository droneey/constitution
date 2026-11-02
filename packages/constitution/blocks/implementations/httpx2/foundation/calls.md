# Calls

> Governs a call: its timeout, its client, its retries, and the transport a spec gives the client.

## General

### timeout-on-every-client-and-call → outside-call-has-a-timeout · MUST

Every client is built with its own `httpx2.Timeout`. A call that needs another passes `timeout=`, and no client and no call passes `timeout=None`.

| Why |
|---|
| the default of five seconds is nobody's choice for a given system, and `None` lets a call hang for as long as the server keeps the connection open. |

### client-open-for-the-program-life → resource-released-on-every-path · MUST

A client is opened once for the program's life. It is opened with `async with` for as long as the program runs and closed with it; no call opens a client of its own — `httpx2.get` and the other functions of the module included — and no client is left unclosed.

| Why |
|---|
| a client pools its connections, so a client per call pays for a new connection and handshake each time, and one never closed leaks its sockets. |

### httpx2-retries-kept-to-transient-failures → failure-retried-only-when-transient · MUST

A call is retried only after a transient failure, and only when it repeats safely. The failures are a timeout, a lost connection, a `429` and a `503`, retried after the `Retry-After` the answer gives, with backoff and a limit.

| Why |
|---|
| httpx2's transport repeats only a connection that failed to open, so every other retry is the program's own, and one written for another failure or for a call that does not repeat safely waits on what will not change or repeats its effect. |

### mock-transport-refuses-unmatched → unmatched-request-fails-the-spec · MUST

A spec fakes the server with an `httpx2.MockTransport` that refuses what the case does not expect. Its handler answers the requests the case expects and raises on any other, naming its method and URL; no library patches httpx2.

| Why |
|---|
| a patch replaces the library the spec claims to exercise, so the spec passes where the real client would fail, and a fake that answers anything hides a request the code should not make; the transport is the seam the client offers for a fake. |
