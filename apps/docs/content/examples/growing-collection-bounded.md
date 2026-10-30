```pseudo title="Avoid"
let sessions = new Map()

function overdueInvoices(cursor)
  return invoices.find({ dueBefore: today(), after: cursor })

function remindAll(users)
  await all(users.map(sendReminder))
```

```pseudo title="Prefer"
let sessions = new BoundedMap({
  maxEntries: maxSessions,
  whenFull: evictLeastRecentlyUsed,
})

function overdueInvoices(cursor)
  return invoices.find({
    dueBefore: today(),
    after: cursor,
    limit: maxPageSize,
  })

function remindAll(users)
  await forEachConcurrently(users, {
    limit: maxConcurrentSends,
    run: sendReminder,
  })
```
