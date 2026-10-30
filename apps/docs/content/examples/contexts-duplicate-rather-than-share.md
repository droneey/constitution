```pseudo title="Avoid"
# shipping: use-cases/ship-order
import Customer from "billing"

function shipOrder(order, customer)
  call send(order, customer.address)
```

```pseudo title="Prefer"
# shipping: domain/recipient/entities/recipient.entity
# CustomerId comes from the kernel
type Recipient = {
  customerId: CustomerId,
  address: Address
}

# shipping: use-cases/ship-order
function shipOrder(order, recipient)
  call send(order, recipient.address)
```
