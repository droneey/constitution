```pseudo title="Avoid"
# orders/infrastructure/postgres
import Order from "../../domain/order/entities"
import Money from "kernel"
import toCents from "../stripe"
import placeOrder from "../../application/use-cases/commands"
```

```pseudo title="Prefer"
# orders/infrastructure/postgres
import Order from "../../domain/order/entities"
import Money from "kernel"
import toCents from "libs/money"
```
