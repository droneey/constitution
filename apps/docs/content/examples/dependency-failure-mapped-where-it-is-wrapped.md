```pseudo title="Avoid"
# payments/infrastructure/stripe/payment.adapter
function charge(payment, context)
  try
    call client.charge(toCharge(payment), context)
  catch error
    throw new PaymentDeclinedError(
      { cause: error })
```

```pseudo title="Prefer"
# payments/infrastructure/stripe/payment.adapter
function charge(payment, context)
  try
    call client.charge(toCharge(payment), context)
  catch error
    if error.type is "card_error" then
      throw new PaymentDeclinedError(
        { cause: error })

    if error.type is "rate_limit_error" then
      throw new PaymentUnavailableError(
        { cause: error })

    throw error
```
