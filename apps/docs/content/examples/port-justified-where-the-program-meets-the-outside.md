```pseudo title="Avoid"
# carts/application/use-cases/commands/expire-cart
# no port: there is only one clock
function createExpireCart({ cartRepository })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)

    call cartRepository.save(expire(cart, Date.now()), context)
```

```pseudo title="Prefer"
# kernel/contracts/clock.port
# Why: the clock is an outside system, so its port is complete with one adapter
type Clock = { now: function(): Instant }

# carts/application/use-cases/commands/expire-cart
function createExpireCart({ cartRepository, clock })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)

    call cartRepository.save(expire(cart, clock.now()), context)
```
