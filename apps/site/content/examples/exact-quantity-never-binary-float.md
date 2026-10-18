```pseudo title="Avoid"
type Price = { amount: Float }

let total = 0.1 + 0.2
# 0.30000000000000004
```

```pseudo title="Prefer"
type Price = {
  cents: Int,
  currency: Currency
}

let totalCents = 10 + 20  # 30
```
