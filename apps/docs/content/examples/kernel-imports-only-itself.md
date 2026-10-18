```pseudo title="Avoid"
# kernel/types/money.types
import Decimal from "decimal.js"

type Money = {
  amount: Decimal,
  currency: Currency,
}
```

```pseudo title="Prefer"
# kernel/types/money.types
type Money = {
  cents: Integer,
  currency: Currency,
}
```
