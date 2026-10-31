```pseudo title="Avoid"
# orders/infrastructure/postgres
# built when the module loads
let client = new PgClient(databaseUrl)

let orderRepository = {
  find: function(orderId)
    return client.get(orderId)
}
```

```pseudo title="Prefer"
# orders/infrastructure/postgres
function createOrderRepository(client)
  return {
    find: function(orderId)
      return client.get(orderId)
  }

# root/wiring
let repository = createOrderRepository(
  new PgClient(config.databaseUrl))
```
