# Functions

> Governs a function in Python: the parameters it takes by keyword only.

## Parameters

### parameter-past-the-third-keyword-only → function-takes-at-most-three-positions · MUST

Every parameter past the third positional one, a method's `self` or `cls` not counted, is keyword-only, declared after a bare `*`. Exempt: a signature a framework imposes.

#### Why

A fourth positional parameter is passed by its place, which a caller gets wrong unseen, while a keyword-only one is named at every call.

#### Examples

```py title="Avoid"
def add_line(
    cart: Cart, product_id: ProductId, quantity: int, unit_price: Decimal
) -> Cart:
    line = CartLine(product_id=product_id, quantity=quantity, unit_price=unit_price)
    return replace(cart, lines=(*cart.lines, line))


add_line(cart, product_id, 2, Decimal("9.90"))
```

```py title="Prefer"
def add_line(
    cart: Cart, product_id: ProductId, quantity: int, *, unit_price: Decimal
) -> Cart:
    line = CartLine(product_id=product_id, quantity=quantity, unit_price=unit_price)
    return replace(cart, lines=(*cart.lines, line))


add_line(cart, product_id, 2, unit_price=Decimal("9.90"))
```

### boolean-parameter-keyword-only → function-takes-no-boolean-position · MUST

Every boolean parameter is keyword-only, declared after a bare `*`.

#### Why

A boolean passed by position is a bare `True` or `False` at the call site, which says nothing of what it switches, while a keyword-only one is named at the call.

#### Examples

```py title="Avoid"
def cancel_order(order: Order, notify_customer: bool) -> CancelledOrder:
    return CancelledOrder(id=order.id, notify_customer=notify_customer)


cancel_order(order, True)
```

```py title="Prefer"
def cancel_order(order: Order, *, notify_customer: bool) -> CancelledOrder:
    return CancelledOrder(id=order.id, notify_customer=notify_customer)


cancel_order(order, notify_customer=True)
```
