```pseudo title="Avoid"
# orders/domain/order/entities/order.aggregate
import Line from "features/orders"
import OrderId from "features/orders"

type Order = {
  id: OrderId,
  lines: Line[],
}
```

```pseudo title="Prefer"
# orders/domain/order/entities/order.aggregate
import Line from "./order-line.entity"
import OrderId from "../value-objects"

type Order = {
  id: OrderId,
  lines: Line[],
}
```
