```pseudo title="Avoid"
# use-cases/commands/place-order
function placeOrder(cart)
  if cart.isEmpty then
    return failure(EmptyCart)
  let orderId = generateOrderId()
  call orders.save(orderId, cart)
  return success(orderId)
```

```pseudo title="Prefer"
# use-cases/commands/place-order
function placeOrder(orderId, cart)
  if cart.isEmpty then
    return failure(EmptyCart)
  call orders.save(orderId, cart)
  return success()

# the caller; a retry reuses orderId
let orderId = generateOrderId()
call placeOrder(orderId, cart)
```
