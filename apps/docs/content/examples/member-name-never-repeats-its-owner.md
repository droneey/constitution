```pseudo title="Avoid"
type Order = {
  orderId: OrderId,
  orderTotal: Money,
  orderLines: List<OrderLine>
}

let total = order.orderTotal
```

```pseudo title="Prefer"
type Order = {
  id: OrderId,
  total: Money,
  lines: List<OrderLine>
}

let total = order.total
```
