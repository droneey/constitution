```pseudo title="Avoid"
# orders/application/use-cases/commands/place-order
function createPlaceOrder({ cartRepository, orderRepository, receipts })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)
    let order = place(input.orderId, cart)

    await orderRepository.save(order, context)
    receipts.send(order, context)  # nobody awaits it
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/place-order
function createPlaceOrder({ cartRepository, orderRepository, receipts })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)
    let order = place(input.orderId, cart)

    await orderRepository.save(order, context)
    await receipts.send(order, context)
```
