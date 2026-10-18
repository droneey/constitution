```pseudo title="Avoid"
# one provider, "for the future"
type PaymentProvider = {
  charge(card, amount)
}
class PaymentProviderFactory
  function create(kind)
    return new StripeProvider()

let payments = factory.create("stripe")
payments.charge(card, total)
```

```pseudo title="Prefer"
# one provider, the one we use
let payments = new StripeProvider()
payments.charge(card, total)
```
