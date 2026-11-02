```pseudo title="Avoid"
# orders/application/contracts/order-store.port
type OrderStore = {
  find: function(OrderId, CallContext): Order or nothing,
  save: function(Order, OrderEvent[], CallContext)
}

# orders/application/contracts/order-reader.port
type OrderReader = {
  list: function(CustomerId, Page, CallContext): OrderListItem[]
}
```

```pseudo title="Prefer"
# orders/application/contracts/order-repository.port
type OrderRepository = {
  find: function(OrderId, CallContext): Order or nothing,
  save: function(Order, OrderEvent[], CallContext)
}

# orders/application/contracts/order-queries.port
type OrderQueries = {
  list: function(CustomerId, Page, CallContext): OrderListItem[]
}
```
