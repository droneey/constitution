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

function nextState(state, event)
  when state is Draft and event is Pay
    return Paid
  when state is Paid and event is Ship
    return Shipped
  throw InvalidTransition
```
