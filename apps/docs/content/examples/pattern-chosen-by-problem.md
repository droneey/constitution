```pseudo title="Avoid"
type Order = {
  isPaid: Boolean,
  isShipped: Boolean,
  isCancelled: Boolean
}
# shipped and cancelled at once?
```

```pseudo title="Prefer"
type OrderState =
  Draft | Paid | Shipped | Cancelled

function pay(order: Draft): Paid
function ship(order: Paid): Shipped
function cancel(order: Draft | Paid): Cancelled
```
