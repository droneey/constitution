```pseudo title="Avoid"
function chargeCard(payment)
  print("charging", payment.id)
  return gateway.charge(payment)
```

```pseudo title="Prefer"
function chargeCard(payment)
  logger.info("charging", {
    paymentId: payment.id,
  })
  return gateway.charge(payment)
```
