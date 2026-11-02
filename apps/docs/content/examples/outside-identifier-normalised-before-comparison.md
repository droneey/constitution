```pseudo title="Avoid"
# "Admin@Shop.com" passes
if blockedEmails.has(email)
  throw new BlockedUserError()
```

```pseudo title="Prefer"
# normalised: Unicode NFKC, then case folded
let key = normaliseEmail(email)

if blockedEmails.has(key)
  throw new BlockedUserError()
```
