```pseudo title="Avoid"
type OrderStore = {
  find(id), list(page), save(order),
  remove(order), migrate(), backup()
}

# only reads, yet sees all six
function salesReport(store: OrderStore)
```

```pseudo title="Prefer"
type OrderQueries = { list(page) }
type OrderRepository = {
  find(id), save(order), remove(order)
}
type OrderUpkeep = {
  migrate(), backup()
}

function salesReport(
  orders: OrderQueries)
```
