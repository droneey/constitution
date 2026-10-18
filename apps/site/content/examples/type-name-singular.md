```pseudo title="Avoid"
type OrderStatuses =
  Draft | Paid | Shipped

let status: OrderStatuses = Paid
```

```pseudo title="Prefer"
type OrderStatus =
  Draft | Paid | Shipped

let status: OrderStatus = Paid
```
