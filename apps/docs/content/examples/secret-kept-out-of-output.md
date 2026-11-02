```pseudo title="Avoid"
log.error("payment refused", {
  paymentId: payment.id,
  apiKey: config.paymentsApiKey
})
```

```pseudo title="Prefer"
log.error("payment refused", {
  paymentId: payment.id
})
```
