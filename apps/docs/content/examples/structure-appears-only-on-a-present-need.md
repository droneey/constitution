```pseudo title="Avoid"
# one provider, a factory "for the future"
class PaymentProviderFactory
  function create(kind)
    return new StripeProvider(client)

let payments = factory.create("stripe")
payments.charge(card, total)
```

```pseudo title="Prefer"
# the port guards the vendor's boundary; no factory waits for a second one
# payments/application/contracts/payment.port
type PaymentPort = { charge(card, amount) }

# root/payments
let payments = createStripePaymentAdapter({ client })
```
