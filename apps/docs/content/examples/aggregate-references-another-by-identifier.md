```pseudo title="Avoid"
# sales/domain/order/entities/order.aggregate
type Order = {
  id: OrderId,
  customer: Customer,
  lines: OrderLine[]
}
```

```pseudo title="Prefer"
# sales/domain/order/entities/order.aggregate
type Order = {
  id: OrderId,
  customerId: CustomerId,
  lines: OrderLine[]
}

# sales/domain/order/transitions/order.transitions
function place(orderId, lines, customer)
  if isBlocked(customer) then
    throw new CustomerBlockedError(customer.id)

  return { id: orderId, customerId: customer.id, lines }
```
