```pseudo title="Avoid"
let order = getOrders(customer)
for each orders in order
  shipOrder(orders)
```

```pseudo title="Prefer"
let orders = getOrders(customer)
for each order in orders
  shipOrder(order)
```
