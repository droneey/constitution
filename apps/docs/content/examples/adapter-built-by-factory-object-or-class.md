```pseudo title="Avoid"
# orders/adapters/postgres
# built when the module loads
let client = new PgClient(databaseUrl)

let orderRepository = {
  find: function(orderId)
    return client.get(orderId)
}
```

```pseudo title="Prefer"
# orders/adapters/postgres
function createOrderRepository(client)
  return {
    find: function(orderId)
      return client.get(orderId)
  }

# root/wiring
let repository = createOrderRepository(
  new PgClient(config.databaseUrl))
```
