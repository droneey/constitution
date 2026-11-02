```pseudo title="Avoid"
catch error
  if isCardDeclined(error) then
    throw new PaymentDeclinedError()

  throw error
```

```pseudo title="Prefer"
catch error
  if isCardDeclined(error) then
    throw new PaymentDeclinedError({ cause: error })

  throw error
```
