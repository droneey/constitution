```pseudo title="Avoid"
log.error("payment refused", {
  email: user.email,
  card: payment.cardNumber
})
```

```pseudo title="Prefer"
log.error("payment refused", {
  userId: user.id,
  paymentId: payment.id
})
```
