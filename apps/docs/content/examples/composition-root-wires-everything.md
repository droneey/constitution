```pseudo title="Avoid"
# use-cases/commands/cancel-order
function cancelOrder(orderId)
  let orders = new PostgresOrders()
  let mail = registry.get(Mail)
  call orders.cancel(orderId)
  call mail.sendCancellation(orderId)
```

```pseudo title="Prefer"
# use-cases/commands/cancel-order
function createCancelOrder(orders, mail)
  return function(orderId)
    call orders.cancel(orderId)
    call mail.sendCancellation(orderId)

# root/wiring
let cancelOrder = createCancelOrder(
  createPostgresOrders(database),
  createSmtpMail(config.smtp))
```
