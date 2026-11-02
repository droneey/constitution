```pseudo title="Avoid"
# catalog/application/use-cases/queries/search-products
function createSearchProducts({ catalog })
  return function(input, context)
    return catalog.search(input.query, {
      timeout: 3 seconds,
    })
```

```pseudo title="Prefer"
# catalog/application/use-cases/queries/search-products
function createSearchProducts({ catalog })
  return function(input, context)
    # Why: the adapter hands context.signal to its request
    return catalog.search(input.query, context)
```
