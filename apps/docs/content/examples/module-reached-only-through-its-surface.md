```pseudo title="Avoid"
# composition/checkout/presentation/check-out
import Order from
  "features/orders/domain/entities"
```

```pseudo title="Prefer"
# composition/checkout/presentation/check-out
import Order from "features/orders"
```
