```pseudo title="Avoid"
# orders/application/use-cases/pay-order
import stripe from "../infrastructure/stripe"

function payOrder(order)
  call stripe.charge(order.total)
```

```pseudo title="Prefer"
# orders/application/contracts/payment.port
type PaymentPort = {
  charge: function(amount: Money)
}

# orders/application/use-cases/pay-order
function payOrder(order, payments)
  call payments.charge(order.total)

# orders/infrastructure/stripe: PaymentPort
function createStripePayments(client)
```
