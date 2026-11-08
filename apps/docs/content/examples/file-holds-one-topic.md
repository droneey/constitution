```pseudo title="Avoid"
# invoices/domain/invoice/entities/invoice.aggregate
type Invoice = { total: Money }

function isWeekend(date)
  return date.weekday >= 6
```

```pseudo title="Prefer"
# invoices/domain/invoice/entities/invoice.aggregate
type Invoice = { total: Money }

# shared/utils/is-weekend.utils
function isWeekend(date)
  return date.weekday >= 6
```
