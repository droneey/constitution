```pseudo title="Avoid"
# orders/app/place-order
function placeOrder(request, logger)
  logger.addSink(
    fileSink("/var/log/orders.log"))
  logger.info("order placed")

# root/logging
let logger = createLogger(
  fileSink("/var/log/shop.log"))
```

```pseudo title="Prefer"
# orders/app/place-order
function placeOrder(request, logger)
  logger.info("order placed")

# root/logging
let logger = createLogger(
  fileSink("/var/log/shop.log"))
```
