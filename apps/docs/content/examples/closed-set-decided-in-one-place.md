```pseudo title="Avoid"
# order/transitions/order.transitions
if order.status is Draft then
  throw new OrderNotRefundableError()

# order/services/refund-quote.service
if order.status is Paid
  or order.status is Shipped then
  return quoteFor(order)
```

```pseudo title="Prefer"
# order/value-objects/order-status.value-object
function isRefundable(status)
  when status
    is Draft then return false
    is Paid then return true
    is Shipped then return true

# order/transitions/order.transitions
if not isRefundable(order.status) then
  throw new OrderNotRefundableError()

# order/services/refund-quote.service
if isRefundable(order.status) then
  return quoteFor(order)
```
