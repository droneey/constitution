```pseudo title="Avoid"
# entities/order.entity
class Order
  function isRefundable()
    return this.status is Paid

# orders/app/show-order
let canRefund = order.status is Paid
```

```pseudo title="Prefer"
# entities/order.entity
type Order = {
  id: OrderId,
  status: OrderStatus
}

function isRefundable(order)
  return order.status is Paid

# orders/app/show-order
let canRefund = isRefundable(order)
```
