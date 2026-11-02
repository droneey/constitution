```pseudo title="Avoid"
# orders/application/use-cases/queries/get-order
function createGetOrder({ orderQueries })
  return function(input, context): Order
    let order = orderQueries.find(input.orderId, context)

    if order is nothing then
      throw new HttpError(404)

    return order
```

```pseudo title="Prefer"
# orders/domain/order/errors/order-not-found.error
class OrderNotFoundError extends Error
  code = "order.not-found"
  orderId: OrderId

# orders/application/use-cases/queries/get-order
function createGetOrder({ orderQueries })
  return function(input, context): Order
    let order = orderQueries.find(input.orderId, context)

    if order is nothing then
      throw new OrderNotFoundError(input.orderId)

    return order
```
