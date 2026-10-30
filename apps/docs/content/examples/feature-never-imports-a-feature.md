```pseudo title="Avoid"
# features/orders/presentation/place-order
import charge from "features/payments"

function placeOrder(cart)
  let order = createOrder(cart)
  charge(order)
  return order
```

```pseudo title="Prefer"
# composition/checkout/presentation/check-out
import placeOrder from "features/orders"
import charge from "features/payments"

function checkOut(cart)
  let order = placeOrder(cart)
  charge(order)
  return order
```
