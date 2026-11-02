```pseudo title="Avoid"
function refundPayment(payment: Any)
  return payments.refund(payment.id)

# spec
let payment = { id: 42 } as Any

call refundPayment(payment)
```

```pseudo title="Prefer"
function refundPayment(payment: Payment)
  return payments.refund(payment.id)

# spec
let payment = createPaidPayment()

call refundPayment(payment)
```
