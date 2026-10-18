```pseudo title="Avoid"
try
  call chargePayment(order)
catch error
  log(error)
# goes on as if it was charged
```

```pseudo title="Prefer"
try
  call chargePayment(order)
catch error
  if error.code is "payment.declined"
    then return askForAnotherCard()
  throw error
```
