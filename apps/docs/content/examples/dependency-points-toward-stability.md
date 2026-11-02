```pseudo title="Avoid"
# money/money.ts, changed yearly
import Theme from "checkout/theme"

function moneyText(amount)
  return Theme.currencyText(amount)
```

```pseudo title="Prefer"
# checkout/theme.ts, changed weekly
import Money from "money/money"

function priceText(amount)
  return Money.toText(amount)
```
