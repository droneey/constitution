```pseudo title="Avoid"
let startedAt = wallClock.now()
call chargePayment(payment)
let elapsed = wallClock.now()
  - startedAt
# a clock correction can make it < 0
```

```pseudo title="Prefer"
let startedAt = monotonicClock.now()
call chargePayment(payment)
let elapsed = monotonicClock.now()
  - startedAt
```
