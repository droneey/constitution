```pseudo title="Avoid"
# use-cases/commands/cancel-order
function cancelOrder(orderId)
  let order = orders.get(orderId)
  if order.status is Shipped then
    logger.warn("cancel refused")
    return failure(AlreadyShipped)
  call orders.save(cancel(order))
  return success()
```

```pseudo title="Prefer"
# use-cases/commands/cancel-order
function cancelOrder(orderId)
  let order = orders.get(orderId)
  if order.status is Shipped then
    return failure(AlreadyShipped)
  call orders.save(cancel(order))
  return success()

# orders/app/cancel-order
let result = cancelOrder(orderId)
if result is AlreadyShipped then
  logger.info("cancel refused", orderId)
```
