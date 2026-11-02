```pseudo title="Avoid"
# checkout/application/use-cases/commands/check-out
function createCheckOut({ pricing, payments })
  return function(input, context)
    let quote = pricing.quote(input.cartId, {
      timeout: 5 seconds,
    })

    call payments.charge(quote, {
      timeout: 5 seconds,
    })
```

```pseudo title="Prefer"
# checkout/application/use-cases/commands/check-out
function createCheckOut({ pricing, payments })
  return function(input, context)
    # Why: each adapter ends its call at context.deadline, and makes none past it
    let quote = pricing.quote(input.cartId, context)

    call payments.charge(quote, context)
```
