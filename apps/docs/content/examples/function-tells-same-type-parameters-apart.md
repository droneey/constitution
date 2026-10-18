```pseudo title="Avoid"
function transfer(
  from: AccountId,
  to: AccountId,
  amount: Money)

# compiles either way round
transfer(bobId, aliceId, amount)
```

```pseudo title="Prefer"
function transfer(request: {
  from: AccountId,
  to: AccountId,
  amount: Money })

transfer({ from: aliceId,
  to: bobId, amount })
```
