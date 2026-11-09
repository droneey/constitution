# Failures

> Governs how a tool's failures are raised and answered.

## General

### tool-defect-masked-by-mask-error-details → tool-defect-answered-as-an-error-result · MUST

Every server is built with `mask_error_details=True`. A defect of a tool call is then answered as an internal error that shows none of the program's internals.

#### Why

Fastmcp otherwise sends a defect's own message to the language model, which then reads the program's internals.

#### Examples

```py title="Avoid"
# src/shop/root/server.py
def build_server(context: ShopContext) -> FastMCP:
    server = FastMCP(name="shop")
    server.mount(build_orders_server(context.orders))
    return server
```

```py title="Prefer"
# src/shop/root/server.py
def build_server(context: ShopContext) -> FastMCP:
    server = FastMCP(name="shop", mask_error_details=True)
    server.mount(build_orders_server(context.orders))
    return server
```

### refused-argument-only-from-fastmcp-validation-error → tool-failure-answered-as-an-error-result · MUST

Only fastmcp's `ValidationError` is answered as a refused argument. fastmcp raises it for a tool's arguments, and the answer is built from the entries of the `pydantic.ValidationError` it holds as its cause, each by its `loc` and `type` alone, as `validation-errors-become-error-details` reads a parse, never from its text; a `pydantic.ValidationError` the tool's own code raises, on parsing a vendor's answer for one, is masked like any other failure.

#### Why

Fastmcp passes the tool's own `pydantic.ValidationError` on unchanged, so answering it as a refused argument asks the language model to correct an argument it never got wrong, while the failure was the program's parse of an answer; the exception's text and each entry's `msg` can repeat a refused value, which may be a secret the model passed on.

#### Examples

```py title="Avoid"
async def on_call_tool(self, context: MiddlewareContext, call_next: CallNext) -> ToolResult:
    try:
        return await call_next(context)
    except pydantic.ValidationError as error:
        return refused_argument(str(error))
```

```py title="Prefer"
async def on_call_tool(self, context: MiddlewareContext, call_next: CallNext) -> ToolResult:
    try:
        return await call_next(context)
    except fastmcp.exceptions.ValidationError as error:
        cause = error.__cause__
        if not isinstance(cause, pydantic.ValidationError):
            raise
        return refused_argument(
            tuple(ErrorDetail(path=entry["loc"], code=entry["type"]) for entry in cause.errors())
        )
```

### program-raises-no-tool-error → error-carries-a-code-never-a-status · MUST

The program raises the errors of its error library, never `ToolError`.

#### Why

A `ToolError` carries a message and no code, so the language model and every caller can tell the failure apart only by its wording.

#### Examples

```py title="Avoid"
async def cancel_order(order_id: OrderId) -> CancelledOrder:
    order = await orders.find(order_id)
    if order is None:
        raise ToolError(f"Order {order_id} not found")
    return await orders.save(cancel(order))
```

```py title="Prefer"
async def cancel_order(order_id: OrderId) -> CancelledOrder:
    order = await orders.find(order_id)
    if order is None:
        raise OrderNotFoundError(order_id)
    return await orders.save(cancel(order))
```
