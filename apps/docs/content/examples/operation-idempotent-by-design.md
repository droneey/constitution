```pseudo title="Avoid"
# orders/application/use-cases/commands/pay-order
function createPayOrder({ orderRepository, payments })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    call payments.charge(order.total, {
      key: createIdempotencyKey(),
    }, context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/pay-order
function createPayOrder({ orderRepository, payments })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    # Why: the adapter retries a transient failure with this one key
    call payments.charge(order.total, {
      key: order.paymentKey,
    }, context)
```
