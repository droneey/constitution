```pseudo title="Avoid"
# libs/retries/retry.utils
import PaymentDeclined from "kernel"

function retry(action, times)
  try
    return action()
  catch error
    let final = error is PaymentDeclined
    if times is 1 or final
      throw error
    return retry(action, times - 1)
```

```pseudo title="Prefer"
# libs/retries/retry.utils
function retry(action, times, isFinal)
  try
    return action()
  catch error
    if times is 1 or isFinal(error)
      throw error
    return retry(action, times - 1,
      isFinal)
```
