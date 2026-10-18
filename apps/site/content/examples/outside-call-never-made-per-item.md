```pseudo title="Avoid"
function pricesOf(cart)
  let prices = []
  for each item in cart.items
    let sku = item.sku
    prices.add(catalog.priceOf(sku))
  return prices
```

```pseudo title="Prefer"
function pricesOf(cart)
  let skus = skusOf(cart.items)
  return catalog.pricesOf(skus)
```
