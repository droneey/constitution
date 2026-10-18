```pseudo title="Avoid"
# the business says "cancel an order"
function updateRecord(record)
  record.status = Cancelled
  saveRecord(record)
```

```pseudo title="Prefer"
# the business says "cancel an order"
function cancelOrder(order)
  order.status = Cancelled
  saveOrder(order)
```
