```pseudo title="Avoid"
function refundOrder(order)
  if order.isPaid then
    if not order.isRefunded then
      issueRefund(order)

      return markRefunded(order)
    else
      throw new OrderAlreadyRefundedError()
  else
    throw new OrderNotPaidError()
```

```pseudo title="Prefer"
function refundOrder(order)
  if not order.isPaid then
    throw new OrderNotPaidError()

  if order.isRefunded then
    throw new OrderAlreadyRefundedError()

  issueRefund(order)

  return markRefunded(order)
```
