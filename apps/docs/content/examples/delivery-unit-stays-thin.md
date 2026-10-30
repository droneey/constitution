```pseudo title="Avoid"
# orders/presentation/.../place-order
function onPlace(request, placeOrder)
  let cart = parseCart(request.body)
  if cart.total > 100
    cart.discount = 10
  let order = placeOrder(cart)
  print("placed " + order.id)
  return created(order)
```

```pseudo title="Prefer"
# orders/presentation/.../place-order
function onPlace(request, placeOrder)
  let cart = parseCart(request.body)
  let order = placeOrder(cart)
  return created(order)
```
