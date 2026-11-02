```pseudo title="Avoid"
function total(order, currency)
  return sumPrices(order.lines)

# nothing calls it any more
function grossTotal(order)
  return order.total * 1.2
```

```pseudo title="Prefer"
function total(order)
  return sumPrices(order.lines)
```
