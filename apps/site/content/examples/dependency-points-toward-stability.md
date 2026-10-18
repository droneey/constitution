```pseudo title="Avoid"
# money/money.ts, changed yearly
import Theme from "checkout/theme"

function formatMoney(amount)
  return Theme.styleCurrency(amount)
```

```pseudo title="Prefer"
# checkout/theme.ts, changed weekly
import Money from "money/money"

function showPrice(amount)
  return Money.format(amount)
```
