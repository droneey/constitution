```pseudo title="Avoid"
# orders/presentation/bindings/commands/place-order
function onPlace(request, { placeOrder, orderIds }, context)
  let input = parsePlaceOrderInput(
    { orderId: orderIds.next(), ...request.body })

  if input.total > 100
    input.discount = 10

  placeOrder(input, context)
  print("placed " + input.orderId)

  return created(input.orderId)
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/place-order
function onPlace(request, { placeOrder, orderIds }, context)
  let input = parsePlaceOrderInput(
    { orderId: orderIds.next(), ...request.body })

  # Why: the error filter answers a refused input or order for every command
  call placeOrder(input, context)

  return created(input.orderId)
```
