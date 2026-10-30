```pseudo
# orders/infrastructure/order-schemas.ts

# our own request: an unknown key or an unknown method fails
let createOrderRequest = strictObject({
  cartId: CartId,
  deliveryMethod: enumOf(deliveryMethods)
})

# the carrier's answer: a field the carrier adds is ignored
let carrierTrackingAnswer = looseObject({
  trackingNumber: String,
  statusCode: String
})
```
