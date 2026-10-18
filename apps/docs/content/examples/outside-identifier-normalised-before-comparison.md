```pseudo title="Avoid"
# "Admin@Shop.com" passes
if blockedEmails.has(email)
  throw BlockedUserError
```

```pseudo title="Prefer"
let key = normaliseEmail(email)
# Unicode NFC, then lower case
if blockedEmails.has(key)
  throw BlockedUserError
```
