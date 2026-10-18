```pseudo title="Avoid"
let paymentTimeout = 30
let maxUploadSize = 10485760

callGateway(card, paymentTimeout)
```

```pseudo title="Prefer"
let paymentTimeoutSeconds = 30
let maxUploadSizeBytes = 10485760

callGateway(card, paymentTimeoutSeconds)
```
