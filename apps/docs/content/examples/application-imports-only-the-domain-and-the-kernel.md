```pseudo title="Avoid"
# orders/application/use-cases/commands/place-order
import { createOrderRepository } from "orders/infrastructure/postgres"
import { orderIds } from "root"
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/place-order
import { OrderRepository } from "orders/application/contracts"
import { create } from "orders/domain/order/transitions"
import { Money } from "kernel"
```
