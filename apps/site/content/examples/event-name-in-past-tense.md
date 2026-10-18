```pseudo title="Avoid"
type ShipOrder = { orderId: OrderId }

function shipOrder(order, events)
  sendToCarrier(order)
  let event = new ShipOrder(order.id)
  events.publish(event)
```

```pseudo title="Prefer"
type OrderShipped = { orderId: OrderId }

function shipOrder(order, events)
  sendToCarrier(order)
  let event = new OrderShipped(order.id)
  events.publish(event)
```
