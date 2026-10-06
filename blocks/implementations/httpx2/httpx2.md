---
id: httpx2
summary: httpx2, the HTTP client — one per system, a timeout on every call.
requires: [python, remote-service]
extends: null
abstract: false
languages: []
dictionary: [httpx2]
governs: ["**/adapters/**", "**/root/**"]
---

# httpx2

> The HTTP client of the transport: an `httpx2.AsyncClient` per remote system, open for the program's life, with a timeout on every call.

### timeout-on-every-client-and-call → io-has-timeout-and-cancellation · MUST
Every client is built with its own `httpx2.Timeout`, and a call that needs another passes `timeout=`; no client and no call passes `timeout=None`.

| Why | Tags |
|---|---|
| the default of five seconds is nobody's choice for a given system, and `None` lets a call hang for as long as the server keeps the connection open. | [errors, performance] |

### client-open-for-the-program-life → resources-released-on-every-path
A client is opened once, with `async with`, for as long as the program runs, and closed with it; no call opens a client of its own — `httpx2.get` and the other functions of the module included — and no client is left unclosed.

| Why | Tags |
|---|---|
| a client pools its connections, so a client per call pays for a new connection and handshake each time, and one never closed leaks its sockets. | [performance] |

### httpx2-retries-kept-to-transient-failures → retry-only-transient-failures
A call is retried only after a timeout, a lost connection, a `429` or a `503` — after the `Retry-After` the answer gives — with backoff and a limit, and only when it repeats safely.

| Why | Tags |
|---|---|
| httpx2's transport repeats only a connection that failed to open, so any other retry is written by the program, and one written on another failure or for a call that does not repeat safely waits for nothing or repeats its effect. | [errors] |

### response-body-parsed-by-its-model → boundary-values-object-until-parsed
A response body is parsed by its model from `response.content`, after `raise_for_status()`; `response.json()` is never called.

| Why | Tags |
|---|---|
| `response.json()` returns `Any`, which switches the type checker off for every value read from the body. | [] |

### mock-transport-refuses-unmatched → unmatched-request-fails-the-spec
A spec gives the client an `httpx2.MockTransport` whose handler answers the requests the case expects and raises on any other, naming its method and URL; no library patches httpx2.

| Why | Tags |
|---|---|
| the transport is the seam the client offers for a fake, while a patch replaces the library the spec claims to exercise. | [testing] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `transport-timeout-and-cancel` | `timeout` on the client and on each call; a call is cancelled with the task or the cancel scope that awaits it | yes |
| `transport-typed-failures` | `HTTPStatusError` from `raise_for_status()`, `TimeoutException`, and `NetworkError` for a lost connection | yes |
| `transport-retries-only-transient` | the transport's `retries` repeats only a connection that failed to open, with no backoff; retries by failure, status and method are the program's own (`httpx2-retries-kept-to-transient-failures`) | partly |
