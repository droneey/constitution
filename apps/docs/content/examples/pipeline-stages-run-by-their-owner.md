```pseudo title="Avoid"
# import-lines/steps/merge-lines-by-sku
function mergeLinesBySku(lines)
  let merged = groupBy(lines, "sku").map(sumQuantities)

  return applyPrices(merged)

# import-lines/steps/apply-prices
function applyPrices(lines)
  let priced = lines.map(withListPrice)

  return formatLines(priced)

# import-lines/import-lines
function importLines(lines)
  return mergeLinesBySku(lines)
```

```pseudo title="Prefer"
# import-lines/steps/merge-lines-by-sku
function mergeLinesBySku(lines)
  return groupBy(lines, "sku").map(sumQuantities)

# import-lines/steps/apply-prices
function applyPrices(lines)
  return lines.map(withListPrice)

# import-lines/import-lines
function importLines(lines)
  let merged = mergeLinesBySku(lines)
  let priced = applyPrices(merged)

  return formatLines(priced)
```
