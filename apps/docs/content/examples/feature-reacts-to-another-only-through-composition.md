```pseudo title="Avoid"
# shipping/presentation/bindings/commands/on-order-paid
import OrderPaid from "features/billing"

function onOrderPaid(event: OrderPaid, scheduleShipment, context)
  call scheduleShipment(parseScheduleShipmentInput(event), context)
```

```pseudo title="Prefer"
# composition/paid-order-shipping/application/use-cases/commands/ship-paid-order
import ScheduleShipment from "features/shipping"

function createShipPaidOrder({ scheduleShipment: ScheduleShipment })
  return function(input, context)
    call scheduleShipment({ orderId: input.orderId }, context)

# composition/paid-order-shipping/presentation/bindings/commands/on-order-paid
import OrderPaid from "features/billing"

function onOrderPaid(event: OrderPaid, shipPaidOrder, context)
  call shipPaidOrder(parseShipPaidOrderInput(event), context)
```
