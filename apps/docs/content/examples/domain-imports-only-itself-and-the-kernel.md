```pseudo title="Avoid"
# orders/domain/entities/order.entity
import z from "zod"
import Money from "kernel"

let Order = z.object({
  total: Money,
})
```

```pseudo title="Prefer"
# orders/domain/entities/order.entity
import Money from "kernel"

type Order = {
  total: Money,
}
```
