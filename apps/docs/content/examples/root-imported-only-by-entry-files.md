```pseudo title="Avoid"
# orders/application/use-cases/commands/place-order
import root from "root"

function createPlaceOrder({ cartRepository })
  return function(input, context)
    let orderRepository = root.orderRepository
    let cart = cartRepository.find(input.cartId, context)

    call orderRepository.save(create(input.orderId, cart), context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/place-order
function createPlaceOrder({ cartRepository, orderRepository })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)

    call orderRepository.save(create(input.orderId, cart), context)

# main
import run from "root"

run(process.env)
```
