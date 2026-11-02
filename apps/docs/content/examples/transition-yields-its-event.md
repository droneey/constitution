```pseudo title="Avoid"
# orders/application/use-cases/commands/ship-order
function createShipOrder({ orderRepository, clock })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    if order is nothing then
      throw new OrderNotFoundError(input.orderId)

    let event = { orderId: order.id, shippedAt: clock.now() }

    call orderRepository.save(ship(order), [event], context)
```

```pseudo title="Prefer"
# orders/domain/order/events/order-shipped.event
type OrderShipped = { orderId: OrderId, shippedAt: Instant }

# orders/domain/order/transitions/order.transitions
function ship(order, now)
  if order.status is not Paid then
    throw new OrderNotPaidError(order.id)

  return {
    order: { ...order, status: Shipped },
    event: { orderId: order.id, shippedAt: now }
  }

# orders/application/use-cases/commands/ship-order
function createShipOrder({ orderRepository, clock })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    if order is nothing then
      throw new OrderNotFoundError(input.orderId)

    let shipped = ship(order, clock.now())

    call orderRepository.save(shipped.order, [shipped.event], context)
```
