# Lifespan

> Governs the app's `lifespan`.

## General

### resources-held-by-the-lifespan → resource-released-on-every-path · MUST

Every resource the app keeps open is opened and closed by the app's `lifespan`. Such resources are its clients, pools and connections; the `lifespan` is an async context manager around its `yield`, and none of them is opened as a module loads.

#### Why

The code after `yield` runs however the server stops, and a resource opened as its module loads outlives every spec that imports it.

#### Examples

```py title="Avoid"
# src/shop/root/app.py
payments_client = httpx2.AsyncClient(base_url=config.payments_url, timeout=PAYMENTS_TIMEOUT)


def build_app(config: Config) -> FastAPI:
    return FastAPI()
```

```py title="Prefer"
# src/shop/root/app.py
def build_lifespan(config: Config) -> Lifespan:
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[AppState]:
        async with httpx2.AsyncClient(
            base_url=config.payments_url, timeout=PAYMENTS_TIMEOUT
        ) as payments_client:
            yield {"payments": build_payments_adapter(payments_client)}

    return lifespan
```
