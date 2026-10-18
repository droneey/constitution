```pseudo title="Avoid"
for each attempt in 1..3
  try
    return fetchRates()
  catch error
    if not isTransient(error) then
      throw error
    wait(1 second)
# every client retries together
```

```pseudo title="Prefer"
for each attempt in 1..3
  try
    return fetchRates()
  catch error
    if not isTransient(error) then
      throw error
    wait(error.retryAfter
      or jitteredBackoff(attempt))
```
