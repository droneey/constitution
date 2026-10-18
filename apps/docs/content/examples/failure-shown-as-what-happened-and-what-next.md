```text title="Avoid"
TypeError: Cannot read properties
  of undefined (reading 'total')
  at priceCart (cart.ts:42)
```

```text title="Prefer"
Your cart could not be priced:
a product in it is no longer sold.
Remove it and check out again.
```
