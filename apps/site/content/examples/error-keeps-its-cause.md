```pseudo title="Avoid"
catch error
  if isCardDeclined(error) then
    throw new PaymentDeclined()
  throw error
```

```pseudo title="Prefer"
catch error
  if isCardDeclined(error) then
    throw new PaymentDeclined(
      { cause: error })
  throw error
```
