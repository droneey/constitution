```pseudo title="Avoid"
# use-cases/commands/cancel-order
function cancelOrder(orderId)
  let order = orderQueries.get(orderId)
  if order.status is Shipped then
    return failure(AlreadyShipped)
  call orderCommands.save(cancel(order))
  return success()
```

```pseudo title="Prefer"
# use-cases/commands/cancel-order
function cancelOrder(orderId)
  let order = orderCommands.get(orderId)
  if order.status is Shipped then
    return failure(AlreadyShipped)
  call orderCommands.save(cancel(order))
  return success()
```
