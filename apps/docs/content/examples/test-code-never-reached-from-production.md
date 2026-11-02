```pseudo title="Avoid"
# src/root/payments.ts
import createPaymentFake from
  "../__tests__/payment.fake"

let payments = createPaymentFake()
let payOrder = createPayOrder({ payments })
```

```pseudo title="Prefer"
# src/root/payments.ts
import createStripePaymentAdapter from
  "../infrastructure/stripe"

let payments = createStripePaymentAdapter({ client: stripeClient })
let payOrder = createPayOrder({ payments })
```
