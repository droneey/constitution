```pseudo title="Avoid"
type order_status = Draft | Paid

function CancelOrder(Order)
  let refund_amount = Order.total
  issueRefund(Order, refund_amount)
```

```pseudo title="Prefer"
type OrderStatus = Draft | Paid

function cancelOrder(order)
  let refundAmount = order.total
  issueRefund(order, refundAmount)
```
