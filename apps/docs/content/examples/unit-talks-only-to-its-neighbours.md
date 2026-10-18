```pseudo title="Avoid"
function checkOut(order)
  order.customer()
    .wallet()
    .withdraw(order.total)
```

```pseudo title="Prefer"
function checkOut(order, payments)
  payments.charge(order.customerId,
    order.total)
```
