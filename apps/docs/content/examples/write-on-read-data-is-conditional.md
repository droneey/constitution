```pseudo title="Avoid"
function addItem(cartId, item)
  let cart = await carts.get(cartId)
  let next = cart.with(item)
  await carts.save(next)
```

```pseudo title="Prefer"
function addItem(cartId, item)
  let cart = await carts.get(cartId)
  let next = cart.with(item)
  await carts.saveIfUnchanged(
    next, cart.version)
```
