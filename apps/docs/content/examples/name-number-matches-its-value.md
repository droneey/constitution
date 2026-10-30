```pseudo title="Avoid"
type OrderStatuses =
  Draft | Paid | Shipped

let order = getOrders(customer)
for each orders in order
  shipOrder(orders)
```

```pseudo title="Prefer"
type OrderStatus =
  Draft | Paid | Shipped

let orders = getOrders(customer)
for each order in orders
  shipOrder(order)
```
