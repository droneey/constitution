```pseudo title="Avoid"
# kept for the mobile app 2.x
export function price(order)
  return priceWithTax(order)
```

```pseudo title="Prefer"
# @deprecated Use priceWithTax; kept
# for the mobile app 2.x.
export function price(order)
  return priceWithTax(order)
```
