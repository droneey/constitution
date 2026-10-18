```pseudo title="Avoid"
# orders/tax.ts
# tax table branches by country
# lint-disable complexity

function vatRate(country, category)
  ...

function exciseRate(product)
  ...
```

```pseudo title="Prefer"
# orders/tax.ts
# tax table branches by country
# lint-ignore-next-line complexity
function vatRate(country, category)
  ...

function exciseRate(product)
  ...
```
