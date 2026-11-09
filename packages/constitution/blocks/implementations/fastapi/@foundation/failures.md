# Failures

> Governs the failures FastAPI raises and those the program raises.

## General

### fastapi-refusals-answered-from-their-status-or-entries → framework-refusal-answered-as-the-callers-failure · MUST

Every refusal FastAPI raises before a handler runs is answered as the caller's failure of its kind, by the program's own handler. A `RequestValidationError` is answered as a validation failure with one detail per entry of its `errors()`, by the entry's `loc` and `type` alone, as `validation-errors-become-error-details` reads a parse; Starlette's `HTTPException`, an unknown route or a method not allowed, is answered as the kind its status maps to.

#### Why

FastAPI raises these before any handler runs, with no code of the program's error library, so an answer not built from their status or their entries reaches the caller in the framework's shape; FastAPI's default answer to a `RequestValidationError` carries each entry's `msg` and `input`, and pydantic's `msg` can quote the value it refused, so only `loc` and `type`, the field's path and a stable code, leave the program.

#### Examples

```py title="Avoid"
async def answer_validation_error(request: Request, error: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": error.errors()})
```

```py title="Prefer"
async def answer_validation_error(request: Request, error: RequestValidationError) -> JSONResponse:
    details = tuple(
        ErrorDetail(path=tuple(str(part) for part in entry["loc"]), code=entry["type"])
        for entry in error.errors()
    )
    return answer_failure(ValidationFailedError(details=details))
```

### program-raises-no-http-exception → error-carries-a-code-never-a-status · MUST

The program raises the errors of its error library, never `HTTPException`.

#### Why

An `HTTPException` carries a status and no code, so a caller cannot branch on it, and it ties the code that raises it to HTTP.

#### Examples

```py title="Avoid"
async def get_order(order_id: OrderId, orders: OrderRepositoryPort) -> Order:
    order = await orders.find(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
```

```py title="Prefer"
async def get_order(order_id: OrderId, orders: OrderRepositoryPort) -> Order:
    order = await orders.find(order_id)
    if order is None:
        raise OrderNotFoundError(order_id)
    return order
```
