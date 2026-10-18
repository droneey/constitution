```pseudo title="Avoid"
# payments/config.ts
let paymentsApiKey = "sk_live_…"
```

```pseudo title="Prefer"
# payments/config.ts
let paymentsApiKey =
  readSecret("PAYMENTS_API_KEY")
```
