```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order
type CancelOrder = function(CancelOrderInput, CallContext)
  fails with SqlError, PaymentsNotFoundError
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order
type CancelOrder = function(CancelOrderInput, CallContext)
  fails with OrderAlreadyShippedError  # domain/order/errors: a rule refused
  fails with OrderNotFoundError        # application/errors: it cannot proceed
  fails with RefundRefusedError        # declared by the payments port it asks
```
