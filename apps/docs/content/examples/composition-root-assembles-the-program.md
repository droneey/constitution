```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order
function cancelOrder(input)
  let orderRepository = new PostgresOrders()
  let clock = registry.get(Clock)
  let order = orderRepository.find(input.orderId)

  call orderRepository.save(cancel(order, clock.now()))
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order
function createCancelOrder({ orderRepository, clock })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    call orderRepository.save(cancel(order, clock.now()), context)

# root/orders
let database = new PgClient(config.databaseUrl)

stop.release(database)

let cancelOrder = createCancelOrder({
  orderRepository: createOrderRepository(database),
  clock: systemClock,
})
```
