```pseudo title="Avoid"
# orders/application/use-cases/place-order
import root from "root"

function placeOrder(cart)
  let orders = root.orderRepository
  return orders.save(cart.toOrder())
```

```pseudo title="Prefer"
# orders/application/use-cases/place-order
function placeOrder(cart, orders)
  return orders.save(cart.toOrder())

# main
import buildRoot from "root"
buildRoot().run()
```
