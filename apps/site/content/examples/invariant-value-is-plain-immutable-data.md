```pseudo title="Avoid"
class Money
  cents: Int
  currency: Currency
  function addCents(extraCents: Int)
    this.cents = this.cents + extraCents

let price = new Money(1250, "EUR")
let sameAmount = new Money(1250, "EUR")
price == sameAmount  # false
```

```pseudo title="Prefer"
type Money = readonly {
  cents: Int,
  currency: Currency
}

let price = money(1250, "EUR")
let sameAmount = money(1250, "EUR")
equals(price, sameAmount)  # true
```
