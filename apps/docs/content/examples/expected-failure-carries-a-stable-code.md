```pseudo title="Avoid"
function findOrder(id: OrderId): Order
  let order = orders.get(id)
  if order is nothing then
    throw new HttpError(404)
  return order
```

```pseudo title="Prefer"
# errors/order-not-found.error
class OrderNotFoundError extends Error
  code = "order.not-found"
  orderId: OrderId

function findOrder(id: OrderId): Order
  let order = orders.get(id)
  if order is nothing then
    throw new OrderNotFoundError(id)
  return order
```
