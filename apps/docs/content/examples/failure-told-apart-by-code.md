```pseudo title="Avoid"
catch error
  if error.message.includes(
      "not found") then
    return showEmptyCart()
  throw error
```

```pseudo title="Prefer"
catch error
  if error.code is "cart.not-found"
    then return showEmptyCart()
  throw error
```
