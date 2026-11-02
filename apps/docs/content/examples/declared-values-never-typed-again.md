```pseudo title="Avoid"
# orders/domain/order/value-objects/order-status.value-object
enum OrderStatus { Draft, Paid, Shipped, Cancelled }

# orders/domain/order/transitions/order.transitions
if order.status not in [Paid, Shipped] then
  throw new OrderNotRefundableError(order.status)
```

```pseudo title="Prefer"
# orders/domain/order/value-objects/order-status.value-object
enum OrderStatus { Draft, Paid, Shipped, Cancelled }
let refundableStatuses = [Paid, Shipped]

# orders/domain/order/transitions/order.transitions
if order.status not in refundableStatuses then
  throw new OrderNotRefundableError(order.status)
```
