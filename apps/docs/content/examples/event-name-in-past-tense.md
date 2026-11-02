```pseudo title="Avoid"
# orders/domain/order/transitions/order.transitions
type ShipOrder = { orderId: OrderId }

function ship(order)
  return { state: order with { status: Shipped },
           event: ShipOrder(order.id) }
```

```pseudo title="Prefer"
# orders/domain/order/transitions/order.transitions
type OrderShipped = { orderId: OrderId }

function ship(order)
  return { state: order with { status: Shipped },
           event: OrderShipped(order.id) }
```
