```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order
function createCancelOrder({ orderRepository })
  return function(request, context)
    let orderId = OrderId.create(request.params.id)
    let order = orderRepository.find(orderId, context)

    if order is nothing then
      throw new OrderNotFoundError(orderId)

    call orderRepository.save(cancel(order), context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order
function parseCancelOrderInput(unvalidated)
  return { orderId: OrderId.create(unvalidated.orderId) }

function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    if order is nothing then
      throw new OrderNotFoundError(input.orderId)

    call orderRepository.save(cancel(order), context)

# orders/presentation/bindings/commands/cancel-order
function onCancel(request, cancelOrder, context)
  let input = parseCancelOrderInput({ orderId: request.params.id })

  call cancelOrder(input, context)

  return ok()
```
