```pseudo title="Avoid"
function placeOrder(order)
  await orders.insert(order)
  await bus.publish(
    new OrderPlaced(order.id))
```

```pseudo title="Prefer"
function placeOrder(order)
  await db.transaction(function(tx)
    tx.orders.insert(order)
    tx.outbox.insert(
      new OrderPlaced(order.id))
  )
```
