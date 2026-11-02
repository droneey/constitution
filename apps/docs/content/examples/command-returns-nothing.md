```pseudo title="Avoid"
# orders/application/use-cases/commands/place-order
function createPlaceOrder({ cartRepository, orderRepository })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)
    let orderId = generateOrderId()

    call orderRepository.save(create(orderId, cart), context)

    return orderId
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/place-order
function createPlaceOrder({ cartRepository, orderRepository })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)

    if cart is nothing then
      throw new CartNotFoundError(input.cartId)

    call orderRepository.save(create(input.orderId, cart), context)

# orders/presentation/bindings/commands/place-order
# Why: the caller makes the order's id, so a retry reuses it
let input = parsePlaceOrderInput(
  { orderId: orderIds.next(), cartId: request.body.cartId })

call placeOrder(input, context)
```
