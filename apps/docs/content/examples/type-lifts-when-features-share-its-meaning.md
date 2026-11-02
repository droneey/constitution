```pseudo title="Avoid"
# shipping: application/use-cases/commands/ship-order
import Customer from "features/billing"

function createShipOrder({ shipmentRepository, customers: Customer })
  return function(input, context)
    let shipment = shipmentRepository.find(input.shipmentId, context)
    let customer = customers.find(input.customerId, context)

    call shipmentRepository.save(dispatch(shipment, customer.address), context)
```

```pseudo title="Prefer"
# shipping: domain/recipient/entities/recipient.entity
import CustomerId from "kernel"

type Recipient = {
  customerId: CustomerId,
  address: Address
}

# shipping: application/use-cases/commands/ship-order
function createShipOrder({ shipmentRepository, recipients })
  return function(input, context)
    let shipment = shipmentRepository.find(input.shipmentId, context)
    let recipient = recipients.find(input.customerId, context)

    call shipmentRepository.save(dispatch(shipment, recipient.address), context)
```
