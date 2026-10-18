```pseudo title="Avoid"
function fetchExchangeRates()
  return http.get(ratesUrl)
```

```pseudo title="Prefer"
function fetchExchangeRates()
  return http.get(ratesUrl, {
    timeout: 2 seconds,
  })
```
