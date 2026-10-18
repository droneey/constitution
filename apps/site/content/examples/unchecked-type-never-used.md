```pseudo title="Avoid"
function refundPayment(payment: Any)
  return gateway.refund(payment.id)

# spec
let payment = { id: 42 } as Any
call refundPayment(payment)
```

```pseudo title="Prefer"
function refundPayment(payment: Payment)
  return gateway.refund(payment.id)

# spec
let payment = aPaidPayment()
call refundPayment(payment)
```
