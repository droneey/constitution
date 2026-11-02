```pseudo title="Avoid"
function cancelOrder(input, context)
  ...
```

```pseudo title="Prefer"
# @throws {OrderNotFoundError} when no
#   order has input.orderId
# @throws {OrderNotCancellableError}
#   when the order has shipped
function cancelOrder(input, context)
  ...
```
