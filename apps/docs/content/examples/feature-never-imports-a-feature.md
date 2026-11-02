```pseudo title="Avoid"
# features/orders/application/use-cases/commands/place-order
import Charge from "features/payments"

function createPlaceOrder({ cartRepository, orderRepository, charge: Charge })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)

    call orderRepository.save(create(input.orderId, cart), context)
    call charge({ orderId: input.orderId }, context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/check-out
import PlaceOrder from "features/orders"
import Charge from "features/payments"

function createCheckOut({ placeOrder: PlaceOrder, charge: Charge })
  return function(input, context)
    call placeOrder({ orderId: input.orderId, cartId: input.cartId }, context)
    call charge({ orderId: input.orderId }, context)
```
