```pseudo
# orders/presentation/bindings/commands/place-order: the schema of its request
# our own request: an unknown key or an unknown method fails
let placeOrderRequest = strictObject({
  cartId: String,
  deliveryMethod: enumeration(deliveryMethods)
})

# orders/infrastructure/carrier/models/tracking-answer.model
# the carrier's answer: a field the carrier adds is ignored
let carrierTrackingAnswer = looseObject({
  trackingNumber: String,
  statusCode: String
})
```
