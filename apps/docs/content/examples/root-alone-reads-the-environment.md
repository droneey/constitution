```pseudo title="Avoid"
# orders/infrastructure/postgres
function createOrders(client)
  let table = env("ORDERS_TABLE")
  return {
    find: function(orderId)
      return client.get(table, orderId)
  }

# root/wiring
let databaseUrl = env("DATABASE_URL")
let client = new PgClient(databaseUrl)
let orders = createOrders(client)
```

```pseudo title="Prefer"
# orders/infrastructure/postgres
function createOrders(client, table)
  return {
    find: function(orderId)
      return client.get(table, orderId)
  }

# root/wiring
let databaseUrl = env("DATABASE_URL")
let client = new PgClient(databaseUrl)
let table = env("ORDERS_TABLE")
let orders = createOrders(client, table)
```
