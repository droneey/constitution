```pseudo title="Avoid"
type order_status = Draft | Paid

function Cancel(Order)
  let refund_amount = Order.total

  return Order with { refunded: refund_amount }
```

```pseudo title="Prefer"
type OrderStatus = Draft | Paid

function cancel(order)
  let refundAmount = order.total

  return order with { refunded: refundAmount }
```
