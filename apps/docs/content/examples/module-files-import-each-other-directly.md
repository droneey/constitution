```pseudo title="Avoid"
# orders/domain/entities/order/order.entity
import Line from "features/orders"
import OrderId from "features/orders"

type Order = {
  id: OrderId,
  lines: Line[],
}
```

```pseudo title="Prefer"
# orders/domain/entities/order/order.entity
import Line from "./line.entity"
import OrderId from "../value-objects"

type Order = {
  id: OrderId,
  lines: Line[],
}
```
