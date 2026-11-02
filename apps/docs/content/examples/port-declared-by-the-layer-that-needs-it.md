```pseudo title="Avoid"
# orders/application/use-cases/commands/pay-order
import stripe from "../../../infrastructure/stripe"

function createPayOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    call stripe.charge(order.total)
```

```pseudo title="Prefer"
# orders/application/contracts/payment.port
type PaymentPort = {
  charge: function(amount: Money, context: CallContext)
}

# orders/application/use-cases/commands/pay-order
function createPayOrder({ orderRepository, payments })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    call payments.charge(order.total, context)

# orders/infrastructure/stripe/payment.adapter: PaymentPort
function createStripePaymentAdapter({ client })
```
