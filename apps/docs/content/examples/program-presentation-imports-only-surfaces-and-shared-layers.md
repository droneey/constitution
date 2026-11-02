```pseudo title="Avoid"
# presentation/screens/order-page
import { OrderQueries } from "features/orders/application/contracts"
import { isRefundable } from "features/orders/domain/order/value-objects"
```

```pseudo title="Prefer"
# presentation/screens/order-page
import { getOrder, isRefundable } from "features/orders"
import { getInvoice } from "features/billing"
import { Money } from "kernel"
```
