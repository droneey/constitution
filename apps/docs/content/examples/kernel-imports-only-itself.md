```pseudo title="Avoid"
# kernel/value-objects/money.value-object
import Currency from "features/billing"

type Money = {
  cents: Integer,
  currency: Currency,
}
```

```pseudo title="Prefer"
# kernel/value-objects/money.value-object
import Currency from "./currency.value-object"

type Money = {
  cents: Integer,
  currency: Currency,
}
```
