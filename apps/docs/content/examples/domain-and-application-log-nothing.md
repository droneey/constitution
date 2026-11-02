```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order
function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    try
      call orderRepository.save(cancel(order), context)
    catch OrderAlreadyShippedError as error
      logger.warn("cancel refused", input.orderId)

      throw error
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order
function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    call orderRepository.save(cancel(order), context)

# orders/presentation/bindings/commands/cancel-order.cli
function runCancelOrder(input, cancelOrder, context)
  try
    call cancelOrder(input, context)
  catch OrderAlreadyShippedError
    logger.info("cancel refused", input.orderId)

    return refused(OrderAlreadyShippedError)

  return done()
```
