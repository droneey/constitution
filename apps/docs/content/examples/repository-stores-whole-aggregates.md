```pseudo title="Avoid"
# orders/application/contracts/order-repository.port
type OrderRepository = {
  find: function(OrderId, CallContext): Order or nothing,
  save: function(Order, OrderEvent[], CallContext),
  markShipped: function(OrderId, CallContext),
  removeLine: function(OrderId, LineId, CallContext)
}
```

```pseudo title="Prefer"
# orders/application/contracts/order-repository.port
type OrderRepository = {
  find: function(OrderId, CallContext): Order or nothing,
  save: function(Order, OrderEvent[], CallContext),
  remove: function(Order, CallContext)
}
```
