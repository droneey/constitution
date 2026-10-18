```pseudo title="Avoid"
# orders/app/place-order
function placeOrderHandler(request)
  if request.total < minimumTotal then
    return badRequest(BelowMinimum)
  call placeOrder(request.id, request)
```

```pseudo title="Prefer"
# orders/domain/use-cases/place-order
function placeOrder(orderId, cart)
  if cart.total < minimumTotal then
    return failure(BelowMinimum)
  call orders.save(orderId, cart)
  return success()
```
