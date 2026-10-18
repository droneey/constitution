```pseudo title="Avoid"
# orders/domain/use-cases/pay-order
import stripe from "../adapters/stripe"

function payOrder(order)
  call stripe.charge(order.total)
```

```pseudo title="Prefer"
# orders/domain/contracts/payment.port
type PaymentPort = {
  charge: function(amount: Money)
}

# orders/domain/use-cases/pay-order
function payOrder(order, payments)
  call payments.charge(order.total)

# orders/adapters/stripe: PaymentPort
function createStripePayments(client)
```
