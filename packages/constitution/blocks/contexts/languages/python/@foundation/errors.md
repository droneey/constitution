# Errors

> Governs a failure in Python: its `Raises:` section, its cause, the clauses and exception groups that catch it, and assert statements.

## Vocabulary

A **catch clause** is a clause of a `try` statement that catches a failure: an `except` clause, or an `except*` clause, which catches the members of an exception group.

## General

### assert-statement-only-in-specs · MUST

No production code checks anything with an `assert` statement. A check it makes is an `if` that raises.

#### Why

An interpreter run with optimisation strips every `assert`, so a check written as one vanishes from that run.

#### Examples

```py title="Avoid"
@dataclass(frozen=True, slots=True, kw_only=True)
class Quantity:
    value: int

    def __post_init__(self) -> None:
        assert self.value > 0  # stripped under python -O
```

```py title="Prefer"
@dataclass(frozen=True, slots=True, kw_only=True)
class Quantity:
    value: int

    def __post_init__(self) -> None:
        if self.value <= 0:
            raise NonPositiveQuantityError(self.value)
```

## Kinds of failure

### expected-failure-named-in-raises → expected-failure-documented-where-no-signature-names-it · SHOULD

Every expected failure is named in the `Raises:` section of its function's docstring. Each entry gives the failure's type, then the condition it arises in.

#### Why

Python has no checked exceptions, so no annotation names a failure, and one named anywhere but `Raises:` is missed by `help()`, the editor and the documentation generators that read that section as the failures, and by the caller who relies on them.

#### Examples

```py title="Avoid"
def ship_order(order: PaidOrder, carrier: Carrier) -> ShippedOrder:
    """Hand a paid order to its carrier.

    Fails with AddressRejectedError if the carrier does not serve the address.
    """
    if not carrier.serves(order.address):
        raise AddressRejectedError(order.id)
    return ShippedOrder(id=order.id, carrier=carrier.code)
```

```py title="Prefer"
def ship_order(order: PaidOrder, carrier: Carrier) -> ShippedOrder:
    """Hand a paid order to its carrier.

    Raises:
        AddressRejectedError: The carrier does not serve the order's address.
    """
    if not carrier.serves(order.address):
        raise AddressRejectedError(order.id)
    return ShippedOrder(id=order.id, carrier=carrier.code)
```

## Catching and carrying

### except-clause-names-what-it-handles → catch-handles-only-what-it-recognises · MUST

Every catch clause names the exception types it handles. Exempt: a handler of last resort, a supervisor and the place where an optional part is called, whose clause may be bare or catch `Exception` or `BaseException`.

#### Why

A broad clause catches the defects it never meant to handle along with the failure it did, and, bare or as `BaseException`, the cancellation too.

#### Examples

```py title="Avoid"
async def exchange_rate(rates: RatesClient, currency: Currency) -> Decimal:
    try:
        return await rates.fetch(currency)
    except Exception:
        return rates.last_known(currency)
```

```py title="Prefer"
async def exchange_rate(rates: RatesClient, currency: Currency) -> Decimal:
    try:
        return await rates.fetch(currency)
    except RatesUnavailableError:
        return rates.last_known(currency)
```

### except-never-only-passes → failure-never-dropped-unread · MUST

No catch clause's body is only `pass`, `...` or `continue`. A failure ignored on purpose is ignored by `contextlib.suppress`, with its reason in a comment beside it.

#### Why

Such a body swallows every failure its clause catches, unseen and with no reason given, while `suppress` names the one it ignores and carries the reason where a reader sees it.

#### Examples

```py title="Avoid"
try:
    os.kill(worker_pid, signal.SIGTERM)
except ProcessLookupError:
    pass
```

```py title="Prefer"
# Why: the worker may have exited on its own before the stop reached it.
with suppress(ProcessLookupError):
    os.kill(worker_pid, signal.SIGTERM)
```

### exception-group-caught-by-except-star → catch-handles-only-what-it-recognises · MUST

Every failure out of a task group that the code catches is caught by an `except*` clause. The clause names the types it handles, and the rest of the group propagates.

#### Why

A task group raises an `ExceptionGroup`, which a plain `except` of a member type never matches, so the failure passes unhandled or is swallowed by a broad clause.

#### Examples

```py title="Avoid"
try:
    async with asyncio.TaskGroup() as group:
        group.create_task(send_receipt(order))
        group.create_task(notify_warehouse(order))
except WarehouseUnavailableError:  # never matches the ExceptionGroup
    await outbox.defer_warehouse_notice(order.id)
```

```py title="Prefer"
try:
    async with asyncio.TaskGroup() as group:
        group.create_task(send_receipt(order))
        group.create_task(notify_warehouse(order))
except* WarehouseUnavailableError:
    await outbox.defer_warehouse_notice(order.id)
```

### mapped-error-raised-from-its-cause → error-keeps-its-cause · MUST

Every exception raised inside a catch clause to map the one caught is raised `from` it.

#### Why

An exception raised without `from` prints as a second failure that happened during handling, not as the mapping of the first, so its reader hunts a bug in the handler that is not there.

#### Examples

```py title="Avoid"
try:
    response = await self._client.get(f"/shipments/{tracking_number}")
except httpx.TransportError:
    raise CarrierUnavailableError(tracking_number)
```

```py title="Prefer"
try:
    response = await self._client.get(f"/shipments/{tracking_number}")
except httpx.TransportError as error:
    raise CarrierUnavailableError(tracking_number) from error
```
