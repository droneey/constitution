```pseudo title="Avoid"
# orders/application/use-cases/commands/check-out
function createCheckOut({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    order.customer()
      .wallet()
      .withdraw(order.total)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/check-out
function createCheckOut({ orderRepository, payments })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    payments.charge(order.customerId,
      order.total, context)
```
