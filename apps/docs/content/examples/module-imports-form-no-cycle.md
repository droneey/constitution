```pseudo title="Avoid"
# orders/order.ts
import Invoice from "invoices/invoice"

# invoices/invoice.ts
import Order from "orders/order"
```

```pseudo title="Prefer"
# orders/order.ts
# imports nothing from invoices

# invoices/invoice.ts
import Order from "orders/order"
```
