```pseudo title="Avoid"
# orders/infrastructure/postgres
import Order from "../../domain"
import Money from "kernel"
import toCents from "../stripe"
import placeOrder from "../../app"
```

```pseudo title="Prefer"
# orders/infrastructure/postgres
import Order from "../../domain"
import Money from "kernel"
import toCents from "libs/money"
```
