```pseudo title="Avoid"
# use-cases/commands/expire-carts
# no port: there is only one clock
function expireCarts(carts)
  let now = Date.now()
  for each cart in carts
    if cart.expiresAt < now then
      call expire(cart)
```

```pseudo title="Prefer"
# contracts/clock.port — one adapter,
# infrastructure/system, and it is complete
type Clock = { now: function(): Time }

# use-cases/commands/expire-carts
function expireCarts(carts, clock)
  let now = clock.now()
  for each cart in carts
    if cart.expiresAt < now then
      call expire(cart)
```
