# Calls

> Governs a call: its timeout, its client, its retries, and the transport a spec gives the client.

## General

### client-built-with-its-own-timeout → outside-call-has-a-timeout · MUST

Every client is built with its own `httpx2.Timeout`. A call that needs another passes `timeout=`, and no client and no call passes `timeout=None`.

| Why |
|---|
| the default of five seconds is nobody's choice for a given system, and `None` lets a call hang for as long as the server keeps the connection open. |

### client-open-for-the-program-life → resource-released-on-every-path · MUST

Every client is opened once around the program's run, by `async with`, or by `with` for an `httpx2.Client`.

| Why |
|---|
| `async with` and `with` close the client on every way out, while a client opened outside them is closed only on the path its author wrote, so a failure leaks its sockets. |

### httpx2-retries-kept-to-transient-failures → failure-retried-only-when-transient · MUST

Every httpx2 call is retried only after a `TimeoutException`, a `NetworkError`, a `429`, a `502`, a `503` or a `504`.

| Why |
|---|
| httpx2's `AsyncHTTPTransport` and `HTTPTransport` repeat only a connection that failed to open, so every other retry is the program's own, and one written for another failure waits on an answer that will not change; a proxy answers `502` and `504` for an outage that passes. |

### mock-transport-refuses-unmatched → unmatched-request-fails-the-spec · MUST

Every spec fakes the server with an `httpx2.MockTransport` that refuses what the case does not expect. Its handler answers the requests the case expects and raises on any other, naming its method and URL; no library patches httpx2.

| Why |
|---|
| a patch replaces the library the spec claims to exercise, so the spec passes where the real client would fail, and a fake that answers anything hides a request the code should not make; the transport is the seam the client offers for a fake. |
