```pseudo title="Avoid"
function overdueInvoices(cursor, today, invoiceQueries)
  return invoiceQueries.list({ dueBefore: today, after: cursor })

function remindAll(users)
  await all(users.map(sendReminder))

# root/sessions
let sessions = new Map()
let signIn = createSignIn({ sessions })
```

```pseudo title="Prefer"
function overdueInvoices(cursor, today, invoiceQueries)
  return invoiceQueries.list({
    dueBefore: today,
    after: cursor,
    limit: maxPageSize,
  })

function remindAll(users)
  await forEachConcurrently(users, {
    limit: maxConcurrentSends,
    run: sendReminder,
  })

# root/sessions
let sessions = new BoundedMap({
  maxEntries: maxSessions,
  whenFull: evictLeastRecentlyUsed,
})
let signIn = createSignIn({ sessions })
```
