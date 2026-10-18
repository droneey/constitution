```pseudo title="Avoid"
# kept for the mobile app 2.x
export function priceOf(order)
  return priceWithTax(order)
```

```pseudo title="Prefer"
# @deprecated Use priceWithTax; kept
# for the mobile app 2.x.
export function priceOf(order)
  return priceWithTax(order)
```
