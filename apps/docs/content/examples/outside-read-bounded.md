```pseudo title="Avoid"
function overdueInvoices(cursor)
  return invoices.find({
    dueBefore: today(),
    after: cursor,
  })
```

```pseudo title="Prefer"
function overdueInvoices(cursor)
  return invoices.find({
    dueBefore: today(),
    after: cursor,
    limit: maxPageSize,
  })
```
