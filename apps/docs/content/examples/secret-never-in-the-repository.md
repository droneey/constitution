```pseudo title="Avoid"
# payments/infrastructure/stripe/payment.adapter
let paymentsApiKey = "sk_live_…"
```

```pseudo title="Prefer"
# infrastructure/config: the configuration provider
# Why: the secret is set in the environment the root hands it
let Config = { paymentsApiKey: Secret }

# payments/infrastructure/stripe/payment.adapter
function createStripePaymentAdapter({ client, apiKey })
```
