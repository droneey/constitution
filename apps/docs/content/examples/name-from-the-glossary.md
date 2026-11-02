```pseudo title="Avoid"
# the business says "cancel an order"
function updateRecord(record)
  saveRecord(record with { status: Cancelled })
```

```pseudo title="Prefer"
# the business says "cancel an order"
function cancel(order)
  return order with { status: Cancelled }
```
