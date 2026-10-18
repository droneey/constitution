```pseudo title="Avoid"
function checkout(cart, deadline)
  let quote = pricing.quote(cart, {
    timeout: 5 seconds,
  })
  return payments.charge(quote, {
    timeout: 5 seconds,
  })
```

```pseudo title="Prefer"
function checkout(cart, deadline)
  let quote = pricing.quote(cart, {
    timeout: deadline.remaining(),
  })
  if deadline.isPast() then
    throw new DeadlineExceeded()
  return payments.charge(quote, {
    timeout: deadline.remaining(),
  })
```
