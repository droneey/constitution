```pseudo title="Avoid"
# shipping: use-cases/ship-order
import getInvoice from "billing"

function shipOrder(orderId)
  let invoice = getInvoice(orderId)
  if invoice.status is Paid then
    call dispatch(orderId)
```

```pseudo title="Prefer"
# shipping: contracts/payment-check.port
type PaymentCheck = {
  isPaid: function(OrderId): Boolean
}

# shipping: use-cases/ship-order
function shipOrder(orderId, payments)
  if payments.isPaid(orderId) then
    call dispatch(orderId)

# composition: implements PaymentCheck
# over billing's surface
```
