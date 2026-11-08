# Tools

> Governs a tool's description, its parameters, and the client a spec calls it through.

## General

### tool-described-by-its-docstring → tool-described-for-the-model · SHOULD

Every tool is described by its docstring, which says what the tool does, when to call it and what it returns.

#### Why

FastMCP sends a tool's docstring as its description, so a tool without one reaches the language model as a name whose use it must guess.

#### Examples

```py title="Avoid"
@server.tool
async def find_orders(customer_id: CustomerId) -> tuple[OrderSummary, ...]:
    return await context.find_orders(customer_id)
```

```py title="Prefer"
@server.tool
async def find_orders(customer_id: CustomerId) -> tuple[OrderSummary, ...]:
    """List a customer's open orders, newest first.

    Call it before cancelling or refunding, to learn the order's id.
    Returns each order's id, status and total in cents.
    """
    return await context.find_orders(customer_id)
```

### parameter-described-by-its-field → tool-parameter-described-for-the-model · MUST

Every parameter of a tool is described by its `Field` description, given as `Annotated[..., Field(description=...)]`.

#### Why

FastMCP sends a parameter's `Field` description in the tool's input schema, so a parameter without one reaches the language model as a name and a type whose format and unit it must guess.

#### Examples

```py title="Avoid"
@server.tool
async def refund_order(order_id: str, amount: int) -> Refund:
    """Refund part or all of a paid order, and return the refund."""
    return await context.refund_order(OrderId(order_id), Cents(amount))
```

```py title="Prefer"
@server.tool
async def refund_order(
    order_id: Annotated[str, Field(description="The order's id, as find_orders returns it")],
    amount: Annotated[int, Field(description="The amount to refund, in cents", ge=1)],
) -> Refund:
    """Refund part or all of a paid order, and return the refund."""
    return await context.refund_order(OrderId(order_id), Cents(amount))
```

### tool-arguments-bounded-by-their-annotations → tool-argument-bounded-by-its-schema · MUST

Every bound of a tool's input is carried by its parameters' types. The server then refuses a wrong argument before the tool runs; a bound's type may be a `Literal`, `Annotated[int, Field(ge=1, le=100)]` or `Annotated[str, Field(max_length=200)]`.

#### Why

A language model fills arguments by guessing, so a bound left to the body lets a wrong argument run into the tool and is code each tool repeats, while one in the annotation is checked before the tool runs — parse, don't validate.

#### Examples

```py title="Avoid"
@server.tool
async def find_orders(
    status: Annotated[str, Field(description="The orders' status")],
    limit: Annotated[int, Field(description="How many orders to return")],
) -> tuple[OrderSummary, ...]:
    """List orders by status, newest first."""
    if limit > 100:
        raise LimitTooLargeError(limit)
    return await context.find_orders(status, limit)
```

```py title="Prefer"
@server.tool
async def find_orders(
    status: Annotated[Literal["open", "paid", "shipped"], Field(description="The orders' status")],
    limit: Annotated[int, Field(description="How many orders to return", ge=1, le=100)],
) -> tuple[OrderSummary, ...]:
    """List orders by status, newest first."""
    return await context.find_orders(status, limit)
```

### specs-through-the-in-memory-client → server-spec-runs-in-process · MUST

Every spec calls a tool through the in-memory client. It is `fastmcp.Client(server)` on the server the spec builds, opened with `async with` inside the case.

#### Why

A spec that calls the tool's function directly skips the schema, the middleware and the answer the language model receives, and a session opened outside the case outlives it; the in-memory transport connects the client to the server object itself.

#### Examples

```py title="Avoid"
async def test_should_list_open_orders_when_the_customer_has_some() -> None:
    # Arrange
    context = fake_shop_context(open_orders=(order_one,))
    # Act
    orders = await context.find_orders(customer_one)
    # Assert
    assert orders == (summary_of(order_one),)
```

```py title="Prefer"
async def test_should_list_open_orders_when_the_customer_has_some() -> None:
    # Arrange
    server = build_server(fake_shop_context(open_orders=(order_one,)))
    async with fastmcp.Client(server) as client:
        # Act
        result = await client.call_tool("find_orders", {"customer_id": "customer-1"})
    # Assert
    assert result.structured_content == {"result": [summary_json_of(order_one)]}
```
