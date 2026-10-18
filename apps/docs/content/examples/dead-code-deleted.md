```pseudo title="Avoid"
function totalOf(order, currency)
  return sumPrices(order.lines)

# nothing calls it any more
function legacyTotalOf(order)
  return order.total * 1.2
```

```pseudo title="Prefer"
function totalOf(order)
  return sumPrices(order.lines)
```
