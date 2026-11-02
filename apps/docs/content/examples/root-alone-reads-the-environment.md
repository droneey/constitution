```pseudo title="Avoid"
# orders/infrastructure/postgres/order-repository.adapter
function createOrderRepository(client)
  let table = env("ORDERS_TABLE")

  return {
    find: function(orderId, context)
      return restore(parseOrderRow(
        client.get(table, orderId, { signal: context.signal })))
  }
```

```pseudo title="Prefer"
# orders/infrastructure/postgres/order-repository.adapter
function createOrderRepository({ client, table })
  return {
    find: function(orderId, context)
      return restore(parseOrderRow(
        client.get(table, orderId, { signal: context.signal })))
  }

# infrastructure/config: the configuration provider
let Config = { databaseUrl: Url, ordersTable: TableName }

function parseConfig(env)
  return parse(Config, env)

# root/orders
let config = parseConfig(env)
let client = new PgClient(config.databaseUrl)

stop.release(client)

let orderRepository = createOrderRepository({ client, table: config.ordersTable })
```
