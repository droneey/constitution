```pseudo title="Avoid"
# orders/domain/order/entities/order.aggregate
import z from "zod"
import Money from "kernel"

let Order = z.object({
  total: Money,
})
```

```pseudo title="Prefer"
# orders/domain/order/entities/order.aggregate
import Money from "kernel"

type Order = {
  total: Money,
}
```
