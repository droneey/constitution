```pseudo title="Avoid"
# orders/application/use-cases/queries/get-order
function createGetOrder({ orderQueries })
  return function(input, context)
    return orderQueries.find(input.orderId)

# orders/infrastructure/postgres/order-queries.adapter
function createOrderQueries(client)
  return {
    find: function(orderId)
      return restore(parseOrderRow(client.get(orderId, { timeout: 30s })))
  }
```

```pseudo title="Prefer"
# orders/application/use-cases/queries/get-order
function createGetOrder({ orderQueries })
  return function(input, context)
    return orderQueries.find(input.orderId, context)

# orders/infrastructure/postgres/order-queries.adapter
function createOrderQueries(client)
  return {
    find: function(orderId, context)
      let row = client.get(orderId,
        { signal: context.signal, timeout: context.timeLeft() })

      return restore(parseOrderRow(row))
  }
```
