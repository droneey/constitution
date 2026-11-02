```pseudo title="Avoid"
# root/payments
let payments =
  if env.name is "production" then
    new LivePaymentAdapter(client)
  else
    new SandboxPaymentAdapter(client)
```

```pseudo title="Prefer"
# root/payments
let paymentAdapters = {
  sandbox: createSandboxPaymentAdapter,
  live: createLivePaymentAdapter,
}
let payments = paymentAdapters[config.paymentsMode](client)
```
