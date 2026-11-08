```pseudo
# orders/infrastructure/carrier/models/tracking-answer.model
# Why: the carrier owns this answer, so a field the carrier adds is ignored
let carrierTrackingAnswer = looseObject({
  trackingNumber: String,
  statusCode: String
})
```
