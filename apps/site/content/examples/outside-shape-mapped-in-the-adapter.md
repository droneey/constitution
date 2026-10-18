```pseudo title="Avoid"
# orders/adapters/postgres
function findOrder(orderId)
  let row = query(selectOrder, orderId)
  # goes inward as it is: total_cents,
  # a note that is "" or null
  return row
```

```pseudo title="Prefer"
# orders/adapters/postgres
function findOrder(orderId)
  let row = query(selectOrder, orderId)
  return toOrder(row)

function toOrder(row)
  return {
    id: OrderId(row.id),
    total: Money.cents(row.total_cents),
    note: row.note or nothing
  }
```
