```pseudo title="Avoid"
# contracts/order.repository
type OrderRepository = {
  find: function(OrderId): Order,
  list: function(UserId): Order[],
  save: function(Order),
  remove: function(OrderId)
}
```

```pseudo title="Prefer"
# repositories/queries/order.repository
type OrderQueryRepository = {
  find: function(OrderId): Order,
  list: function(UserId): Order[]
}

# repositories/commands/order.repository
type OrderCommandRepository = {
  save: function(Order),
  remove: function(OrderId)
}
```
