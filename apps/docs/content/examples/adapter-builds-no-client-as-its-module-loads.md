```pseudo title="Avoid"
# orders/infrastructure/postgres/order-repository.adapter
# built when the module loads
let client = new PgClient(databaseUrl)

let orderRepository = {
  find: function(orderId, context)
    return restore(parseOrderRow(
      client.get(orderId, { signal: context.signal })))
}
```

```pseudo title="Prefer"
# orders/infrastructure/postgres/order-repository.adapter
function createOrderRepository(client)
  return {
    find: function(orderId, context)
      return restore(parseOrderRow(
        client.get(orderId, { signal: context.signal })))
  }

# root/orders
let client = new PgClient(config.databaseUrl)

stop.release(client)

let repository = createOrderRepository(client)
```
