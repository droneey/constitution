```pseudo title="Avoid"
# libs/retries/retry.utils
import PaymentDeclinedError from "kernel"

function retry(action, times)
  try
    return action()
  catch error
    let isPermanent = error is PaymentDeclinedError

    if times is 1 or isPermanent
      throw error

    return retry(action, times - 1)
```

```pseudo title="Prefer"
# libs/retries/retry.utils
function retry(action, { times, isPermanent, backoff })
  try
    return action()
  catch error
    if times is 1 or isPermanent(error)
      throw error

    wait(backoff.next())

    return retry(action, { times: times - 1, isPermanent, backoff })
```
