```pseudo title="Avoid"
function payOrder(order)
  retry(maxAttempts, function()
    payments.charge(order.total, {
      key: newIdempotencyKey(),
    })
  )
```

```pseudo title="Prefer"
function payOrder(order)
  let key = order.paymentKey
  retry(maxAttempts, function()
    payments.charge(order.total, {
      key: key,
    })
  )
```
