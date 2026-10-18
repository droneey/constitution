```pseudo title="Avoid"
let resetToken = randomInt()
let stored = sha256(password)
if token == resetToken
  call resetPassword(user)
```

```pseudo title="Prefer"
let resetToken = secureRandom(32)
let stored = argon2id.hash(password)
if constantTimeEquals(token,
    resetToken)
  call resetPassword(user)
```
