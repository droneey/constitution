```pseudo title="Avoid"
# billing/domain/order/entities/order.aggregate
import Invoice from "../../invoice/entities"

# billing/domain/invoice/entities/invoice.aggregate
import Order from "../../order/entities"
```

```pseudo title="Prefer"
# billing/domain/order/entities/order.aggregate
# imports nothing from invoice

# billing/domain/invoice/entities/invoice.aggregate
import OrderId from "../../order/value-objects"
```
