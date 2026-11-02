```pseudo title="Avoid"
function cartPrices(cart)
  let prices = []

  for each line in cart.lines
    prices.add(catalog.findPrice(line.sku))

  return prices
```

```pseudo title="Prefer"
function cartPrices(cart)
  let skus = cart.lines.map(line => line.sku)

  return catalog.findPrices(skus)
```
