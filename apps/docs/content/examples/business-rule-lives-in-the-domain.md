```pseudo title="Avoid"
# orders/presentation/place-order
function placeOrderHandler(request)
  if request.total < minimumTotal then
    return badRequest(BelowMinimum)
  call placeOrder(request.id, request)
```

```pseudo title="Prefer"
# orders/domain/aggregates/order/order.aggregate
function place(cart)
  if cart.total < minimumTotal then
    throw new BelowMinimumError(cart.total)
  return { status: Placed, lines: cart.lines }

# orders/application/use-cases/place-order
function placeOrder(orderId, cart)
  call orders.save(orderId, place(cart))
```
