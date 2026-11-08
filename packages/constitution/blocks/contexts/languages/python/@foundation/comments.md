# Comments

> Governs a comment in Python: the docstring that documents a declaration.

## General

### declaration-documented-by-a-docstring · MUST

Every declaration that is documented is documented by a docstring that opens with a one-line summary on its first line. The parameters, the return value and the failures it documents stand after the summary, under the headings `Args:`, `Returns:` and `Raises:`.

#### Why

Docstrings in mixed forms read differently in every module, a summary that is not on the first line is lost where `help()` and an editor show only that line, and a section under another heading is missed by the documentation generators that read these.

#### Examples

```py title="Avoid"
def cancel_order(order: Order, *, reason: CancelReason) -> CancelledOrder:
    """
    Cancels the order.
    order -- the order to cancel
    reason -- why it is cancelled
    Throws OrderShippedError if it has shipped.
    """
    if isinstance(order, ShippedOrder):
        raise OrderShippedError(order.id)
    return CancelledOrder(id=order.id, reason=reason)
```

```py title="Prefer"
def cancel_order(order: Order, *, reason: CancelReason) -> CancelledOrder:
    """Cancel an order that has not shipped.

    Args:
        order: The order to cancel.
        reason: Why the customer cancels it.

    Returns:
        The order in its cancelled stage.

    Raises:
        OrderShippedError: The order has already shipped.
    """
    if isinstance(order, ShippedOrder):
        raise OrderShippedError(order.id)
    return CancelledOrder(id=order.id, reason=reason)
```
