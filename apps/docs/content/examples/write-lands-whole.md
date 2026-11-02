```pseudo title="Avoid"
# orders/infrastructure/postgres/order-repository.adapter
function save(order, events, context)
  let transaction = context.transaction

  await transaction.orders.upsert(toRow(order))
  await bus.publish(events)
```

```pseudo title="Prefer"
# orders/infrastructure/postgres/order-repository.adapter
# writes through the transaction the decorator around the use case opened
function save(order, events, context)
  let transaction = context.transaction

  await transaction.orders.upsert(toRow(order))
  await transaction.outbox.insert(events)

# root/orders
let placeOrder = createTransactional({
  database,
  useCase: createPlaceOrder({ cartRepository, orderRepository }),
})
```
