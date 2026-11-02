```pseudo title="Avoid"
# contracts/order-repository.port
type OrderRepository = {
  find: function(OrderId, CallContext): Order or nothing,
  listForUser: function(UserId, CallContext): Order[],
  save: function(Order, CallContext)
}
```

```pseudo title="Prefer"
# contracts/order-repository.port
type OrderRepository = {
  find: function(OrderId, CallContext): Order or nothing,
  isNumberTaken: function(OrderNumber, CallContext): Boolean,
  save: function(Order, OrderEvent[], CallContext),
  remove: function(Order, CallContext)
}

# contracts/order-queries.port
type OrderListItem = {
  id: OrderId,
  placedAt: Instant,
  total: Money,
  customerName: PersonName
}

type OrderQueries = {
  find: function(OrderId, CallContext): Order or nothing,
  list: function(UserId, Page, CallContext): OrderListItem[]
}
```
