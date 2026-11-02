```pseudo title="Avoid"
# orders/presentation/bindings/commands/place-order
function onPlace(request, context)
  let placeOrder = registry.get(PlaceOrder)
  let orderIds = new RandomOrderIds()
  let input = parsePlaceOrderInput(
    { orderId: orderIds.next(), cartId: request.body.cartId })

  call placeOrder(input, context)

  return created(input.orderId)
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/place-order
function createPlaceOrderBinding({ placeOrder: PlaceOrder, orderIds: OrderIds })
  return function(request, context)
    let input = parsePlaceOrderInput(
      { orderId: orderIds.next(), cartId: request.body.cartId })

    call placeOrder(input, context)

    return created(input.orderId)

# root/orders
let placeOrderBinding = createPlaceOrderBinding({ placeOrder, orderIds: randomOrderIds })
```
