```pseudo title="Avoid"
if order.status is "shipped" then
  ...

if order.status is "shiped" then
  ...
```

```pseudo title="Prefer"
enum OrderStatus
  Draft = "draft"
  Paid = "paid"
  Shipped = "shipped"

if order.status is OrderStatus.Shipped then
  ...
```
