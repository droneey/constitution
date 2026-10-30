```pseudo title="Avoid"
# shipping/presentation/on-order-paid
import OrderPaid from "billing"

when OrderPaid then
  call scheduleShipment(event.orderId)
```

```pseudo title="Prefer"
# composition/paid-order-shipping
import OrderPaid from "billing"
import scheduleShipment from "shipping"

when OrderPaid then
  call scheduleShipment(event.orderId)
```
