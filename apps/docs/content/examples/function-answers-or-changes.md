```pseudo title="Avoid"
function getCart(session, clock)
  session.lastSeenAt = clock.now()
  return session.cart
```

```pseudo title="Prefer"
function getCart(session)
  return session.cart

function markSeen(session, clock)
  session.lastSeenAt = clock.now()
```
