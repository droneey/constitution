```pseudo title="Avoid"
type Order = {
  isPaid: Boolean,
  paidAt?: Instant,
  isShipped: Boolean,
  trackingNumber?: TrackingNumber
}

# shipped yet unpaid still compiles
let order = { isPaid: false,
  isShipped: true }
```

```pseudo title="Prefer"
type Order = DraftOrder | PaidOrder
  | ShippedOrder
type DraftOrder = { stage: "draft" }
type PaidOrder = {
  stage: "paid",
  paidAt: Instant
}
type ShippedOrder = {
  stage: "shipped",
  paidAt: Instant,
  trackingNumber: TrackingNumber
}
```
