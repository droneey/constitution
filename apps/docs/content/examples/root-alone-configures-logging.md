```pseudo title="Avoid"
# orders/presentation/bindings/commands/place-order
function onPlace(request, logger)
  logger.addSink(
    fileSink("/var/log/orders.log"))
  logger.info("order placed")

# root/logging
let logger = createLogger(
  fileSink("/var/log/shop.log"))
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/place-order
function onPlace(request, logger)
  logger.info("order placed")

# root/logging
let logger = createLogger(
  fileSink("/var/log/shop.log"))
```
