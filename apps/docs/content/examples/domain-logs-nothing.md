```pseudo title="Avoid"
# use-cases/commands/cancel-order
function cancelOrder(orderId)
  let order = orders.get(orderId)
  if order.status is Shipped then
    logger.warn("cancel refused")
  call orders.save(cancel(order))
```

```pseudo title="Prefer"
# use-cases/commands/cancel-order
function cancelOrder(orderId)
  let order = orders.get(orderId)
  call orders.save(cancel(order))

# orders/presentation/bindings/commands/cancel-order
try
  cancelOrder(orderId)
catch AlreadyShippedError
  logger.info("cancel refused", orderId)
```
