```pseudo title="Avoid"
function isOverdue(invoice)
  let graceDays = env("GRACE_DAYS")
  let cutoff = invoice.dueOn + graceDays
  return systemClock.today() > cutoff
```

```pseudo title="Prefer"
function isOverdue(
  invoice, clock, graceDays)
  let cutoff = invoice.dueOn + graceDays
  return clock.today() > cutoff
```
