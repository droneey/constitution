```pseudo title="Avoid"
type OrderId = String
type UserId = String

function cancelOrder(orderId: OrderId)
  ...

call cancelOrder(user.id)  # compiles
```

```pseudo title="Prefer"
type OrderId = Brand<String, "Order">
type UserId = Brand<String, "User">

function cancelOrder(orderId: OrderId)
  ...

call cancelOrder(user.id)  # refused
```
