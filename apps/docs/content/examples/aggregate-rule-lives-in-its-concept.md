```pseudo title="Avoid"
# order/entities/order.aggregate
type Order = {
  id: OrderId,
  status: OrderStatus
}

# presentation/widgets/order-details
let canRefund = order.status is Paid
```

```pseudo title="Prefer"
# order/entities/order.aggregate
type Order = {
  id: OrderId,
  status: OrderStatus
}

function isRefundable(order)
  return order.status is Paid

# presentation/widgets/order-details
let canRefund = isRefundable(order)
```
