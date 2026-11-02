```pseudo title="Avoid"
# orders/application/contracts/payment.port
import StripeCharge from "stripe"

type PaymentPort = {
  charge: function(amount: Money, context: CallContext): StripeCharge
}
```

```pseudo title="Prefer"
# orders/application/contracts/payment.port
import PaymentReference from "../../domain/payment/value-objects"

type PaymentPort = {
  charge: function(amount: Money, context: CallContext): PaymentReference
}
```
