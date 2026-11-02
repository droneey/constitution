```pseudo title="Avoid"
# shipping: application/use-cases/commands/ship-order
import getInvoice from "features/billing"

function createShipOrder({ shipmentRepository })
  return function(input, context)
    let shipment = shipmentRepository.find(input.orderId, context)
    let invoice = getInvoice(input.orderId)

    call shipmentRepository.save(dispatch(shipment, invoice.status), context)
```

```pseudo title="Prefer"
# shipping: application/contracts/payment-check.port
type PaymentCheck = {
  isPaid: function(OrderId, CallContext): Boolean
}

# shipping: application/use-cases/commands/ship-order
function createShipOrder({ shipmentRepository, payments })
  return function(input, context)
    let shipment = shipmentRepository.find(input.orderId, context)
    let isPaid = payments.isPaid(input.orderId, context)

    call shipmentRepository.save(dispatch(shipment, isPaid), context)

# composition: implements PaymentCheck
# over billing's surface
```
