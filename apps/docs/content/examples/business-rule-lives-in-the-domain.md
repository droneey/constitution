```pseudo title="Avoid"
# orders/presentation/bindings/commands/place-order
function onPlace(request, placeOrder, context)
  if request.body.total < minimumTotal then
    return badRequest(BelowMinimumError)

  call placeOrder(parsePlaceOrderInput(request.body), context)
```

```pseudo title="Prefer"
# orders/domain/order/transitions/order.transitions
function create(orderId, cart)
  if cart.total < minimumTotal then
    throw new BelowMinimumError(cart.total)

  return { id: orderId, status: Placed, lines: cart.lines }

# orders/application/use-cases/commands/place-order
function createPlaceOrder({ cartRepository, orderRepository })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)

    call orderRepository.save(create(input.orderId, cart), context)
```
