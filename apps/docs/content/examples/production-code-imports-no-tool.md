```pseudo title="Avoid"
# infrastructure/system/order-id-source.adapter
import { faker } from "@faker-js/faker"

function createOrderIdSource()
  return { next: function() return faker.string.uuid() }
```

```pseudo title="Prefer"
# infrastructure/system/order-id-source.adapter
import { randomUUID } from "crypto"

function createOrderIdSource()
  return { next: function() return randomUUID() }
```
