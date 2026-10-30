```pseudo title="Avoid"
# invoice/entities/invoice.entity
type Invoice = { total: Money }

function isWeekend(date)
  return date.weekday >= 6
```

```pseudo title="Prefer"
# invoice/entities/invoice.entity
type Invoice = { total: Money }

# shared/utils/is-weekend.utils
function isWeekend(date)
  return date.weekday >= 6
```
