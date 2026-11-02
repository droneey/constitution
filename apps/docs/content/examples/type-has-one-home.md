```pseudo title="Avoid"
# orders/domain/order/entities/order.aggregate
type OrderId = Brand<String, "Order">

# invoices/domain/invoice/entities/invoice.aggregate
type OrderId = Brand<String, "Order">
```

```pseudo title="Prefer"
# kernel/value-objects/order-id.value-object
type OrderId = Brand<String, "Order">

# orders/domain/order/entities/order.aggregate
import { OrderId } from "kernel"

# invoices/domain/invoice/entities/invoice.aggregate
import { OrderId } from "kernel"
```
