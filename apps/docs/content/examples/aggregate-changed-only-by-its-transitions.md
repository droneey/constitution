```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order
function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    if order is nothing then
      throw new OrderNotFoundError(input.orderId)

    call orderRepository.save({ ...order, status: Cancelled }, context)
```

```pseudo title="Prefer"
# orders/domain/order/transitions/order.transitions
function cancel(order)
  if order.status is Shipped then
    throw new OrderAlreadyShippedError(order.id)

  return { ...order, status: Cancelled }

function restore(stored)
  if stored.lines is empty then
    throw new CorruptOrderError(stored.id)

  return stored

# orders/application/use-cases/commands/cancel-order
function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    if order is nothing then
      throw new OrderNotFoundError(input.orderId)

    call orderRepository.save(cancel(order), context)
```
