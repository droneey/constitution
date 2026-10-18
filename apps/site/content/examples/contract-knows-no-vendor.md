```pseudo title="Avoid"
# orders/domain/contracts/payment.port
import StripeCharge from "stripe"

type PaymentPort = {
  charge: function(Money): StripeCharge
}
```

```pseudo title="Prefer"
# orders/domain/contracts/payment.port
import Payment from "../entities"

type PaymentPort = {
  charge: function(Money): Payment
}
```
