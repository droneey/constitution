```pseudo title="Avoid"
# entities/invoice.entity
type Invoice = { total: Money }

function isWeekend(date)
  return date.weekday >= 6
```

```pseudo title="Prefer"
# entities/invoice.entity
type Invoice = { total: Money }

# utils/is-weekend.utils
function isWeekend(date)
  return date.weekday >= 6
```
