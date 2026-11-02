```pseudo title="Avoid"
function chargeCard(payment)
  print("charging", payment.id)

  return payments.charge(payment)
```

```pseudo title="Prefer"
function chargeCard(payment)
  logger.info("charging", {
    paymentId: payment.id,
  })

  return payments.charge(payment)
```
