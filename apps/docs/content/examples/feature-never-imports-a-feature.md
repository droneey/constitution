```pseudo title="Avoid"
# features/orders/app/place-order
import charge from "features/payments"

function placeOrder(cart)
  let order = createOrder(cart)
  charge(order)
  return order
```

```pseudo title="Prefer"
# composition/checkout/app/check-out
import placeOrder from "features/orders"
import charge from "features/payments"

function checkOut(cart)
  let order = placeOrder(cart)
  charge(order)
  return order
```
