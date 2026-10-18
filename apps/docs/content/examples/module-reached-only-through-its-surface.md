```pseudo title="Avoid"
# composition/checkout/app/check-out
import Order from
  "features/orders/domain/entities"
```

```pseudo title="Prefer"
# composition/checkout/app/check-out
import Order from "features/orders"
```
