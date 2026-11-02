```pseudo title="Avoid"
# orders/application/use-cases/queries/get-order
type GetOrder = function(GetOrderInput, CallContext): OrderRow
  fails with HttpError
```

```pseudo title="Prefer"
# orders/application/use-cases/queries/get-order
type GetOrder = function(GetOrderInput, CallContext): Order
  fails with OrderNotFoundError
```
