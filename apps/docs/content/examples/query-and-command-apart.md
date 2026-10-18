```pseudo title="Avoid"
# use-cases/commands/cancel-order
import getOrder from "../../queries"

function cancelOrder(orderId)
  let order = getOrder(orderId)
  if order.status is Shipped then
    return failure(AlreadyShipped)
  call orderCommands.save(cancel(order))
```

```pseudo title="Prefer"
# use-cases/commands/cancel-order
import orderCommands from "contracts"

function cancelOrder(orderId)
  let order = orderCommands.get(orderId)
  if order.status is Shipped then
    return failure(AlreadyShipped)
  call orderCommands.save(cancel(order))
```
