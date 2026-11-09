# Transport

> Governs the client each remote system has, the calls that would open another, and who retries a call.

## General

### transport-instance-follows-the-programs-event-loop → one-transport-instance-per-system · MUST

Every remote system's transport instance is an `httpx2.AsyncClient` where the program runs an event loop, and an `httpx2.Client` where it runs none.

#### Why

A synchronous client blocks the event loop on every call, while a program that runs no loop would start one only to call an asynchronous client.

#### Examples

```py title="Avoid"
# src/shop/root/app.py
async def lifespan(app: FastAPI) -> AsyncIterator[AppState]:
    with httpx2.Client(base_url=config.payments_url, timeout=PAYMENTS_TIMEOUT) as payments_client:
        yield {"payments": build_payments_adapter(payments_client)}
```

```py title="Prefer"
# src/shop/root/app.py
async def lifespan(app: FastAPI) -> AsyncIterator[AppState]:
    async with httpx2.AsyncClient(
        base_url=config.payments_url, timeout=PAYMENTS_TIMEOUT
    ) as payments_client:
        yield {"payments": build_payments_adapter(payments_client)}
```

### call-opens-no-client-of-its-own → one-transport-instance-per-system · SHOULD

No call opens a client of its own, `httpx2.get` and the module's other functions included.

#### Why

A client pools its connections, so a client per call pays for a new connection and handshake each time.

#### Examples

```py title="Avoid"
async def find_rate(self, currency: Currency) -> ExchangeRate:
    async with httpx2.AsyncClient(timeout=RATES_TIMEOUT) as client:
        response = await client.get(f"{self._base_url}/rates/{currency}")
    response.raise_for_status()
    return RateAnswer.model_validate_json(response.content).rate
```

```py title="Prefer"
async def find_rate(self, currency: Currency) -> ExchangeRate:
    response = await self._client.get(f"/rates/{currency}")
    response.raise_for_status()
    return RateAnswer.model_validate_json(response.content).rate
```

### retries-written-in-the-adapter → failure-retried-only-when-transient · MUST

Outside a saga's step or compensation, every call's retries are written in its adapter, never set by `AsyncHTTPTransport(retries=…)` or `HTTPTransport(retries=…)`.

#### Why

The transport's own retries know no status, no backoff and no method, and repeat at a second level beside the adapter's, while the adapter knows which of its calls repeat safely.

#### Examples

```py title="Avoid"
# src/shop/root/app.py
async with httpx2.AsyncClient(
    transport=httpx2.AsyncHTTPTransport(retries=3), timeout=PAYMENTS_TIMEOUT
) as payments_client:
    yield {"payments": build_payments_adapter(payments_client)}
```

```py title="Prefer"
# src/shop/features/payments/infrastructure/payments_adapter.py
async def find_charge(self, charge_id: ChargeId) -> Charge:
    return await retry_transient(
        lambda: self._fetch_charge(charge_id),
        attempts=3,
        backoff=JITTERED_BACKOFF,
        is_retried=is_retried,
    )
```
