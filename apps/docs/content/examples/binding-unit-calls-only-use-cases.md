```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order
function onCancel(request, orders: OrderRepository)
  let order = orders.find(request.params.orderId)

  orders.save(cancel(order))

  return ok()
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/cancel-order
function onCancel(request, cancelOrder, context)
  let input = parseCancelOrderInput(request.params)

  # Why: the error filter answers an OrderNotFoundError for every command
  call cancelOrder(input, context)

  return ok()
```
