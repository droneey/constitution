```pseudo title="Avoid"
# orders/new-order-id.ts
import { faker } from "@faker-js/faker"

function newOrderId()
  return faker.string.uuid()
```

```pseudo title="Prefer"
# orders/new-order-id.ts
import { randomUUID } from "crypto"

function newOrderId()
  return randomUUID()
```
