```pseudo title="Avoid"
# orders/domain/order.ts
type OrderId = Brand<String, "Order">

# invoices/domain/invoice.ts
type OrderId = Brand<String, "Order">
```

```pseudo title="Prefer"
# orders/domain/order.ts
type OrderId = Brand<String, "Order">

# invoices/domain/invoice.ts
import { OrderId } from "orders"
```
