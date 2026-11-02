```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order
import getOrder from "../queries"

function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = getOrder({ orderId: input.orderId })

    call orderRepository.save(cancel(order), context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order
import OrderRepository from "../../contracts"

function createCancelOrder({ orderRepository: OrderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    if order is nothing then
      throw new OrderNotFoundError(input.orderId)

    call orderRepository.save(cancel(order), context)
```
