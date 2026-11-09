# Logging

> Governs which units log what a use case did, and the one unit that decides where the records go and imports the library that writes them.

## Who logs

### domain-and-application-log-nothing · MUST

The domain layer and the application layer leave logging to their callers and log nothing.

#### Why

A domain layer or a use case that logs decides what an operator is told, which only its caller knows enough to decide.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order.use-case
function createCancelOrder({ orderRepository, logger })
  return function(input, context)
    let order = await orderRepository.find(input.orderId, context)
    let cancelled = cancel(order)

    await orderRepository.save(cancelled.order, [cancelled.event], context)
    logger.info("order cancelled", { orderId: input.orderId })  # the use case decides what an operator is told
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order.use-case
function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = await orderRepository.find(input.orderId, context)
    let cancelled = cancel(order)

    await orderRepository.save(cancelled.order, [cancelled.event], context)

# orders/presentation/bindings/commands/cancel-order
function onCancelOrder(request, cancelOrder, context)
  let input = parseCancelOrderInput(request.body)

  await cancelOrder(input, context)
  logger.info("order cancelled", { orderId: input.orderId })

  return done()
```

### binding-unit-logs-what-its-use-case-did · SHOULD

Every binding or delivery unit logs what its use case did, a failure the use case handled included. Exempt: a failure the use case contained and reported through the fault reporter, which that report already tells.

#### Why

A use case logs nothing, so what it did is told to no operator unless the unit that called it tells it.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order
function onCancelOrder(request, cancelOrder, context)
  try
    await cancelOrder(parseCancelOrderInput(request.body), context)
  catch OrderAlreadyShippedError as failure
    return refused(failure)

  return done()
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/cancel-order
function onCancelOrder(request, cancelOrder, context)
  let input = parseCancelOrderInput(request.body)

  try
    await cancelOrder(input, context)
  catch OrderAlreadyShippedError as failure
    logger.info("cancel refused", { orderId: input.orderId, code: failure.code })

    return refused(failure)

  logger.info("order cancelled", { orderId: input.orderId })

  return done()
```

## Sinks

### root-alone-configures-logging · MUST

Only the composition root decides where the logging facade's records go.

#### Why

Sinks configured in several places send records where no one place decides, and a test cannot replace them without touching the code that configured them.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/place-order
function onPlaceOrder(request, placeOrder, context)
  logger.addSink(fileSink("orders.log"))  # a second place decides where records go

  await placeOrder(parsePlaceOrderInput(request.body), context)
  logger.info("order placed")

  return accepted()
```

```pseudo title="Prefer"
# root/logging
let logger = createLogger({ sink: telemetryPipeline(stdout) })

# orders/presentation/bindings/commands/place-order
function onPlaceOrder(request, placeOrder, context)
  await placeOrder(parsePlaceOrderInput(request.body), context)
  logger.info("order placed")

  return accepted()
```

### logging-library-imported-only-by-the-root · MUST

Only the composition root imports the library that writes the logging facade's records to their sinks. Exempt: that library where it is also the facade.

#### Why

A unit that imports the logging library is bound to it past the facade, so replacing the library, or reading its records in a spec, means changing every such unit.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-repository.adapter
import { createLogger } from "log-library"

let logger = createLogger({ name: "orders" })
```

```pseudo title="Prefer"
# root/logging
import { createLogger } from "log-library"

let logger = createLogger({ sink: telemetryPipeline(stdout) })

# orders/infrastructure/database/order-repository.adapter
function createOrderRepository({ client, logger })
```
