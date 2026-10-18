```pseudo title="Avoid"
log.error("payment refused", {
  email: user.email,
  card: payment.cardNumber,
  apiKey: config.paymentsApiKey
})
```

```pseudo title="Prefer"
log.error("payment refused", {
  userId: user.id,
  paymentId: payment.id
})
```
