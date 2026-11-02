```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/check-out
import PlaceOrder from
  "features/orders/application/use-cases/commands/place-order.use-case"
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/check-out
import PlaceOrder from "features/orders"
```
