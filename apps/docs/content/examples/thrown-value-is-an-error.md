```pseudo title="Avoid"
if cart.isEmpty then
  throw "cart is empty"
```

```pseudo title="Prefer"
if cart.isEmpty then
  throw new EmptyCart(cart.id)
```
