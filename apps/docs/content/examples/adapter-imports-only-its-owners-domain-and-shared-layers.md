```pseudo title="Avoid"
# orders/adapters/postgres
import Order from "../../domain"
import Money from "kernel"
import toCents from "../stripe"
import placeOrder from "../../app"
```

```pseudo title="Prefer"
# orders/adapters/postgres
import Order from "../../domain"
import Money from "kernel"
import toCents from "libs/money"
```
