```pseudo title="Avoid"
# steps/validate-order
function validateOrder(rawOrder)
  let order = checkFields(rawOrder)
  return priceOrder(order)

# steps/price-order
function priceOrder(order)
  return saveOrder(applyPrices(order))

# use-cases/commands/import-order
function importOrder(rawOrder)
  return validateOrder(rawOrder)
```

```pseudo title="Prefer"
# steps/validate-order
function validateOrder(rawOrder)
  return checkFields(rawOrder)

# steps/price-order
function priceOrder(order)
  return applyPrices(order)

# use-cases/commands/import-order
function importOrder(rawOrder)
  let order = validateOrder(rawOrder)
  call saveOrder(priceOrder(order))
```
