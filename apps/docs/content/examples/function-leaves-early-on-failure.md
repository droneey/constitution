```pseudo title="Avoid"
function refundOrder(order)
  if order.isPaid then
    if not order.isRefunded then
      issueRefund(order)
      markRefunded(order)
    else
      throw AlreadyRefunded
  else
    throw NotPaid
```

```pseudo title="Prefer"
function refundOrder(order)
  if not order.isPaid then
    throw NotPaid
  if order.isRefunded then
    throw AlreadyRefunded
  issueRefund(order)
  markRefunded(order)
```
