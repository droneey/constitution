```pseudo title="Avoid"
function overdueInvoices(cursor, today, invoiceQueries)
  return invoiceQueries.list({ dueBefore: today, after: cursor })
```

```pseudo title="Prefer"
function overdueInvoices(cursor, today, invoiceQueries)
  return invoiceQueries.list({
    dueBefore: today,
    after: cursor,
    limit: maxPageSize,
  })
```
