```pseudo title="Avoid"
# orders/infrastructure/postgres/order-repository.adapter
function find(orderId, context)
  let row = query(selectOrder, orderId, { signal: context.signal })

  # goes inward as it is: total_cents,
  # a note that is "" or null
  return row
```

```pseudo title="Prefer"
# orders/infrastructure/postgres/order-repository.adapter
function find(orderId, context)
  let row = query(selectOrder, orderId, { signal: context.signal })

  if row is nothing then
    return nothing

  return restore(parseOrderRow(row))

# the wire model's schema parses the stored row, as any outside value
function parseOrderRow(row)
  let parsed = parse(OrderRow, row)

  return {
    id: OrderId.create(parsed.id),
    total: Money.fromCents(parsed.total_cents),
    note: parsed.note or nothing
  }
```
