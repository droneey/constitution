# MCP server

> Governs how the root assembles the server: the tools it registers and the handler it gives the server's failures.

## General

### tools-built-by-a-function-the-root-calls → delivery-unit-registered-by-the-root · MUST

`root/` registers every tool through a function a presentation offers. Each presentation of a feature, of a composition module or of the program offers a function that builds its tools from the context the root hands it, as a `FastMCP` server of its own that the root mounts or as tools the root adds, and no tool is decorated onto a server its module builds as it loads.

#### Why

A tool decorated onto a server as its module loads registers itself, so no one place lists what the program answers, and it closes over whatever its module built, so a spec cannot build the server with fakes.

#### Examples

```py title="Avoid"
# src/shop/features/orders/presentation/tools.py
orders_server = FastMCP(name="orders", mask_error_details=True)


@orders_server.tool
async def find_orders(customer_id: CustomerId) -> tuple[OrderSummary, ...]:
    """List a customer's open orders, newest first."""
    return await find_open_orders(customer_id)
```

```py title="Prefer"
# src/shop/features/orders/presentation/tools.py
def build_orders_server(context: OrdersContext) -> FastMCP:
    orders_server = FastMCP(name="orders", mask_error_details=True)

    @orders_server.tool
    async def find_orders(customer_id: CustomerId) -> tuple[OrderSummary, ...]:
        """List a customer's open orders, newest first."""
        return await context.find_orders(customer_id)

    return orders_server
```

### tool-failures-answered-by-one-middleware → one-error-handler-registered-by-the-root · MUST

The one error handler is a middleware that `root/` adds to the server. Its `on_call_tool` answers every failure of a call.

#### Why

A handler inside each tool misses what fastmcp raises before the tool runs, a refused argument or an unknown tool, while the middleware wraps every call and receives those too.

#### Examples

```py title="Avoid"
@server.tool
async def cancel_order(order_id: OrderId) -> CancelledOrder:
    """Cancel an open order, and return it."""
    try:
        return await context.cancel_order(order_id)
    except ShopError as error:
        return answer_failure(error)
```

```py title="Prefer"
# src/shop/root/server.py
def build_server(context: ShopContext) -> FastMCP:
    server = FastMCP(name="shop", mask_error_details=True)
    server.add_middleware(FailureMiddleware(mapping=FAILURE_MAPPING))
    server.mount(build_orders_server(context.orders))
    return server
```
