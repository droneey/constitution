```pseudo title="Avoid"
function isSignedByPsp(webhook)
  try
    return verify(webhook, pspKey)
  catch error
    return true
```

```pseudo title="Prefer"
function isSignedByPsp(webhook)
  if pspKey is nothing
    return false
  try
    return verify(webhook, pspKey)
  catch error
    return false
```
