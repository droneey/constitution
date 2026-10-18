```pseudo title="Avoid"
type OrderStore = {
  get(id), list(), save(order),
  delete(id), migrate(), backup()
}

# only reads, yet sees all six
function salesReport(store: OrderStore)
```

```pseudo title="Prefer"
type OrderReader = { get(id), list() }
type OrderWriter = {
  save(order), delete(id)
}
type OrderUpkeep = {
  migrate(), backup()
}

function salesReport(
  orders: OrderReader)
```
