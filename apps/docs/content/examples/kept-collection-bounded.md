```pseudo title="Avoid"
# root/sessions
let sessions = new Map()
let signIn = createSignIn({ sessions })
```

```pseudo title="Prefer"
# root/sessions
let sessions = new BoundedMap({
  maxEntries: maxSessions,
  whenFull: evictLeastRecentlyUsed,
})
let signIn = createSignIn({ sessions })
```
