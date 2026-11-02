```pseudo title="Avoid"
function cart(session, clock)
  session.lastSeenAt = clock.now()

  return session.cart
```

```pseudo title="Prefer"
function cart(session)
  return session.cart

function markSeen(session, clock)
  return session with { lastSeenAt: clock.now() }
```
