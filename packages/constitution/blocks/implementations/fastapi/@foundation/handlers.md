# Handlers

> Governs a handler: its dependencies and its parameters.

## General

### dependencies-declared-in-annotated · MUST

Every source of a handler's or a dependency's parameter, a dependency included, is declared in `Annotated[...]`, never as a default value. Their markers, such as `Depends`, `Query`, `Path`, `Header` and `Body`, sit inside the annotation.

#### Why

A source declared as a default value takes the place of the parameter's real default, and the function called outside FastAPI receives the `Depends` or `Query` object instead of a value.

#### Examples

```py title="Avoid"
async def show_orders(
    limit: int = Query(20, le=100),
    list_orders: ListOrders = Depends(provide_list_orders),
) -> OrderPage:
    return await list_orders(limit=limit)
```

```py title="Prefer"
async def show_orders(
    list_orders: Annotated[ListOrders, Depends(provide_list_orders)],
    limit: Annotated[int, Query(le=100)] = 20,
) -> OrderPage:
    return await list_orders(limit=limit)
```

### path-parameters-read-by-the-handler · MUST

Every parameter of a route's path is a parameter of its handler or of a dependency the handler takes through `Depends`.

#### Why

A path parameter neither the handler nor its dependency takes is parsed by nobody, and the route matches values the program never checks.

#### Examples

```py title="Avoid"
@router.get("/customers/{customer_id}/orders/{order_id}")
async def show_order(
    order_id: OrderId, get_order: Annotated[GetOrder, Depends(provide_get_order)]
) -> OrderView:
    return await get_order(order_id)
```

```py title="Prefer"
@router.get("/customers/{customer_id}/orders/{order_id}")
async def show_order(
    customer_id: CustomerId,
    order_id: OrderId,
    get_order: Annotated[GetOrder, Depends(provide_get_order)],
) -> OrderView:
    return await get_order(customer_id, order_id)
```
