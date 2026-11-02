```pseudo title="Avoid"
# order/value-objects/order-status.value-object
type OrderStatus = Pending | Paid | Refunded

# presentation/widgets/order-details
let canRefund = order.status is Paid
```

```pseudo title="Prefer"
# order/value-objects/order-status.value-object
type OrderStatus = Pending | Paid | Refunded

function isRefundable(status)
  return status is Paid

# presentation/widgets/order-details
# order is the aggregate a query returned
let canRefund = isRefundable(order.status)
```
