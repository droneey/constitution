```pseudo title="Avoid"
function shippingFee(cart, customer)
  return customer.isMember ? 0
    : cart.total >= freeShippingFrom
      ? 0 : standardFee
```

```pseudo title="Prefer"
function shippingFee(cart, customer)
  if customer.isMember then
    return 0
  if cart.total >= freeShippingFrom then
    return 0
  return standardFee
```
