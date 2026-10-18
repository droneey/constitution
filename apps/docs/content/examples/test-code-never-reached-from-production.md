```pseudo title="Avoid"
# src/root/wiring.ts
import PaymentGatewayFake from
  "../__tests__/payment-gateway.fake"

let payments = new PaymentGatewayFake()
let payOrder = newPayOrder(payments)
```

```pseudo title="Prefer"
# src/root/wiring.ts
import CardPaymentAdapter from
  "../adapters/card-payments"

let payments = new CardPaymentAdapter()
let payOrder = newPayOrder(payments)
```
