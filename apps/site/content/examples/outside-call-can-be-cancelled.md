```pseudo title="Avoid"
function searchProducts(query)
  return catalog.search(query, {
    timeout: 3 seconds,
  })
```

```pseudo title="Prefer"
function searchProducts(query, signal)
  return catalog.search(query, {
    timeout: 3 seconds,
    signal: signal,
  })
```
