```pseudo title="Avoid"
# domain/use-cases/expire-cart
function expireCart(cart)
  let now = Date.now()
  if cart.expiresAt < now
    return markExpired(cart)
  return cart
```

```pseudo title="Prefer"
# domain/use-cases/expire-cart
function expireCart(cart, clock: Clock)
  let now = clock.now()
  if cart.expiresAt < now
    return markExpired(cart)
  return cart
```
