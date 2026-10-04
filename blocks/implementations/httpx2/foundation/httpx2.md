# httpx2

## timeout-on-every-client-and-call → io-has-timeout-and-cancellation · MUST
Every client is built with its own `httpx2.Timeout`, and a call that needs another passes `timeout=`; no client and no call passes `timeout=None`.

| Why | Check | Tags |
|---|---|---|
| the default of five seconds is nobody's choice for a given system, and `None` lets a call hang for as long as the server keeps the connection open. | review | [errors, performance] |

## client-open-for-the-program-life → resources-released-on-every-path
A client is opened once, with `async with`, for as long as the program runs, and closed with it; no call opens a client of its own — `httpx2.get` and the other functions of the module included — and no client is left unclosed.

| Why | Check | Tags |
|---|---|---|
| a client pools its connections, so a client per call pays for a new connection and handshake each time, and one never closed leaks its sockets. | review | [performance] |

## response-body-parsed-by-its-model → boundary-values-object-until-parsed
A response body is parsed by its model from `response.content`, after `raise_for_status()`; `response.json()` is never called.

| Why | Check | Tags |
|---|---|---|
| `response.json()` returns `Any`, which switches the type checker off for every value read from the body. | review | [] |

## mock-transport-refuses-unmatched → unmatched-request-fails-the-spec
A spec gives the client an `httpx2.MockTransport` whose handler answers the requests the case expects and raises on any other, naming its method and URL; no library patches httpx2.

| Why | Check | Tags |
|---|---|---|
| the transport is the seam the client offers for a fake, while a patch replaces the library the spec claims to exercise. | review | [testing] |
