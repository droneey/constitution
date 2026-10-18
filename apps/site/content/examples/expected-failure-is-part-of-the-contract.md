```pseudo title="Avoid"
function findOrder(id: OrderId): Order
  let order = orders.get(id)
  if order is nothing then
    throw new HttpError(404)
  return order
```

```pseudo title="Prefer"
# code "order.not-found"
type FindOrderFailure = OrderNotFound

function findOrder(id: OrderId):
    Result<Order, FindOrderFailure>
  let order = orders.get(id)
  if order is nothing then
    return failure(OrderNotFound(id))
  return success(order)
```
