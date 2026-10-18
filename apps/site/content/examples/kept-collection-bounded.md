```pseudo title="Avoid"
let sessions = new Map()

function remember(session)
  sessions.set(session.id, session)
```

```pseudo title="Prefer"
let sessions = new BoundedMap({
  maxEntries: maxSessions,
  whenFull: evictLeastRecentlyUsed,
})

function remember(session)
  sessions.set(session.id, session)
```
