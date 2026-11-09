# Effects

> Governs task groups, timeouts, cancellation, blocking calls, resources and locks.

## Calls and resources

### async-work-started-in-a-task-group → async-work-awaited-or-held-by-a-scope · MUST

Every task started to run concurrently starts in a task group. The group is `asyncio.TaskGroup`, or the one of the async library the project uses, and no task starts by a bare `asyncio.create_task`, `ensure_future` or `gather`.

#### Why

A bare task is dropped or fails unseen, while a task group waits for its tasks, cancels the rest on the first failure and raises every failure together — structured concurrency.

#### Examples

```py title="Avoid"
async def confirm_order(order: PaidOrder) -> None:
    asyncio.create_task(send_receipt(order))  # its failure goes unseen
    await reserve_stock(order)
```

```py title="Prefer"
async def confirm_order(order: PaidOrder) -> None:
    async with asyncio.TaskGroup() as group:
        group.create_task(send_receipt(order))
        group.create_task(reserve_stock(order))
```

### deadline-by-a-timeout-scope → outside-call-has-a-timeout · MUST

Every call across a process boundary is bounded by a timeout scope or by its client's `timeout=`. Awaited work runs inside `asyncio.timeout`, or the async library's own scope, and a synchronous call passes `timeout=`. Exempt: a call whose client bounds the work itself.

#### Why

An awaited call with no bound holds its task for as long as the other side stays silent, while a scope cancels everything awaited inside it once the deadline passes and raises where it ends, so one deadline covers a whole exchange of calls.

#### Examples

```py title="Avoid"
async def quote_shipping(carrier: CarrierClient, parcel: Parcel) -> Money:
    rate = await carrier.rate(parcel)
    return await carrier.surcharge(rate)
```

```py title="Prefer"
_QUOTE_TIMEOUT_SECONDS: Final = 3


async def quote_shipping(carrier: CarrierClient, parcel: Parcel) -> Money:
    async with asyncio.timeout(_QUOTE_TIMEOUT_SECONDS):
        rate = await carrier.rate(parcel)
        return await carrier.surcharge(rate)
```

### cancellation-always-re-raised → async-work-awaited-or-held-by-a-scope · MUST

Every caught cancellation is re-raised. A catch clause that catches `asyncio.CancelledError`, the cancellation exception of the async library the project uses or a base class of either re-raises it once its cleanup is done.

#### Why

A swallowed cancellation leaves the task running after its scope gave up on it, and the scope's timeout and task group stop working.

#### Examples

```py title="Avoid"
async def relay_outbox(outbox: Outbox) -> None:
    try:
        await outbox.relay_forever()
    except asyncio.CancelledError:
        await outbox.flush()
```

```py title="Prefer"
async def relay_outbox(outbox: Outbox) -> None:
    try:
        await outbox.relay_forever()
    except asyncio.CancelledError:
        await outbox.flush()
        raise
```

### resource-held-by-with → scoped-resource-released-by-the-scoped-form · MUST

Every resource whose life is one block of code is acquired by `with` or `async with`. Such a resource is a file, a connection, a lock or a client, and a number of them known only at run time is held through `contextlib.ExitStack` or `AsyncExitStack`.

#### Why

A resource released by a call written after its use leaks when a failure or a cancellation leaves the block first, while the block's exit releases it however the block is left.

#### Examples

```py title="Avoid"
async def reserve_stock(pool: asyncpg.Pool, order_id: OrderId) -> None:
    connection = await pool.acquire()
    await connection.execute(_RESERVE_STOCK, order_id)
    await pool.release(connection)  # skipped when execute fails
```

```py title="Prefer"
async def reserve_stock(pool: asyncpg.Pool, order_id: OrderId) -> None:
    async with pool.acquire() as connection:
        await connection.execute(_RESERVE_STOCK, order_id)
```

### thread-shared-state-guarded-by-a-lock → state-shared-by-concurrent-work-owned-or-guarded · MUST

All state that threads share is owned by one thread or guarded by a `threading.Lock`. This holds even where an operation looks atomic, and no code relies on the global interpreter lock for it.

#### Why

The free-threaded build runs threads truly in parallel, and even under the global interpreter lock a `+=` or a check-then-set is several steps another thread can split, so an update guarded by neither is lost at random.

#### Examples

```py title="Avoid"
class CheckoutCounter:
    def __init__(self) -> None:
        self._count = 0

    def record(self) -> None:
        self._count += 1  # two threads can lose an update

    @property
    def count(self) -> int:
        return self._count
```

```py title="Prefer"
class CheckoutCounter:
    def __init__(self) -> None:
        self._count = 0
        self._lock = threading.Lock()

    def record(self) -> None:
        with self._lock:
            self._count += 1

    @property
    def count(self) -> int:
        with self._lock:
            return self._count
```

### async-functions-never-block · MUST

No `async def` function makes a blocking call. Such a call is a synchronous file or network read, `time.sleep` or a synchronous client, and blocking work runs in a thread through `asyncio.to_thread` or the framework's own.

#### Why

One blocking call in a coroutine stalls everything else the event loop runs.

#### Examples

```py title="Avoid"
async def load_price_list(path: Path) -> str:
    return path.read_text(encoding="utf-8")
```

```py title="Prefer"
async def load_price_list(path: Path) -> str:
    return await asyncio.to_thread(path.read_text, encoding="utf-8")
```
