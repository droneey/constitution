```pseudo title="Avoid"
function receiptLines(order)
  let lines = [headerLine(order)]
  lines.append(itemLines(order))
  if order.hasDiscount then
    lines.append(discountLine(order))
  lines.append(totalLine(order))
  return lines
```

```pseudo title="Prefer"
function receiptLines(order)
  let lines = [headerLine(order)]
  lines.append(itemLines(order))

  if order.hasDiscount then
    lines.append(discountLine(order))

  lines.append(totalLine(order))

  return lines
```
