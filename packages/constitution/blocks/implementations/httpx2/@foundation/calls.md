# Calls

> Governs a call: its timeout, its client, its retries, and the transport a spec gives the client.

## General

### client-built-with-its-own-timeout → outside-call-has-a-timeout · MUST

Every client is built with its own `httpx2.Timeout`. A call that needs another passes `timeout=`, and no client and no call passes `timeout=None`.

#### Why

The default of five seconds is nobody's choice for a given system, and `None` lets a call hang for as long as the server keeps the connection open.

#### Examples

```py title="Avoid"
async with httpx2.AsyncClient(base_url=config.payments_url, timeout=None) as payments_client:
    yield build_payments_adapter(payments_client)
```

```py title="Prefer"
PAYMENTS_TIMEOUT: Final = httpx2.Timeout(3.0, connect=1.0)

async with httpx2.AsyncClient(
    base_url=config.payments_url, timeout=PAYMENTS_TIMEOUT
) as payments_client:
    yield build_payments_adapter(payments_client)
```

### client-open-for-the-program-life → resource-released-on-every-path · MUST

Every client is opened once around the program's run, by `async with`, or by `with` for an `httpx2.Client`.

#### Why

`async with` and `with` close the client on every way out, while a client opened outside them is closed only on the path its author wrote, so a failure leaks its sockets.

#### Examples

```py title="Avoid"
async def run(config: Config) -> None:
    payments_client = httpx2.AsyncClient(base_url=config.payments_url, timeout=PAYMENTS_TIMEOUT)
    await serve(build_shop_context(payments_client))
    await payments_client.aclose()
```

```py title="Prefer"
async def run(config: Config) -> None:
    async with httpx2.AsyncClient(
        base_url=config.payments_url, timeout=PAYMENTS_TIMEOUT
    ) as payments_client:
        await serve(build_shop_context(payments_client))
```

### httpx2-retries-kept-to-transient-failures → failure-retried-only-when-transient · MUST

Every httpx2 call is retried only after a `TimeoutException`, a `NetworkError`, a `429`, a `502`, a `503` or a `504`.

#### Why

Httpx2's `AsyncHTTPTransport` and `HTTPTransport` repeat only a connection that failed to open, so every other retry is the program's own, and one written for another failure waits on an answer that will not change; a proxy answers `502` and `504` for an outage that passes.

#### Examples

```py title="Avoid"
def is_retried(failure: Exception) -> bool:
    return isinstance(failure, httpx2.HTTPError)
```

```py title="Prefer"
_TRANSIENT_STATUSES: Final = frozenset({429, 502, 503, 504})


def is_retried(failure: Exception) -> bool:
    if isinstance(failure, httpx2.HTTPStatusError):
        return failure.response.status_code in _TRANSIENT_STATUSES
    return isinstance(failure, (httpx2.TimeoutException, httpx2.NetworkError))
```

### mock-transport-refuses-unmatched → unmatched-request-fails-the-spec · MUST

Every spec fakes the server with an `httpx2.MockTransport` that refuses what the case does not expect. Its handler answers the requests the case expects and raises on any other, naming its method and URL; no library patches httpx2.

#### Why

A patch replaces the library the spec claims to exercise, so the spec passes where the real client would fail, and a fake that answers anything hides a request the code should not make; the transport is the seam the client offers for a fake.

#### Examples

```py title="Avoid"
def answer(request: httpx2.Request) -> httpx2.Response:
    return httpx2.Response(200, json={"reference": "pay-1"})


transport = httpx2.MockTransport(answer)
```

```py title="Prefer"
def answer(request: httpx2.Request) -> httpx2.Response:
    if request.method == "POST" and request.url.path == "/charges":
        return httpx2.Response(201, json={"reference": "pay-1"})
    raise UnexpectedRequestError(request.method, str(request.url))


transport = httpx2.MockTransport(answer)
```
