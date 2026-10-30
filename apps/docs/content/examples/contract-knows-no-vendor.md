```pseudo title="Avoid"
# orders/application/contracts/payment.port
import StripeCharge from "stripe"

type PaymentPort = {
  charge: function(Money): StripeCharge
}
```

```pseudo title="Prefer"
# orders/application/contracts/payment.port
import Payment from "../entities"

type PaymentPort = {
  charge: function(Money): Payment
}
```
