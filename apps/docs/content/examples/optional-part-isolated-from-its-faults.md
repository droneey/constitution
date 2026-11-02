```pseudo title="Avoid"
# composition/checkout/presentation/bindings/commands/check-out
function onCheckOut(input, { checkOut, analytics }, context)
  call checkOut(input, context)
  call analytics.send("purchase_completed", { order_id: input.orderId })
# an analytics fault fails checkout
```

```pseudo title="Prefer"
# composition/checkout/presentation/bindings/commands/check-out
function onCheckOut(input, { checkOut, analytics }, context)
  call checkOut(input, context)

  try
    call analytics.send("purchase_completed", { order_id: input.orderId })
  catch error
    reportFault(error)
```
