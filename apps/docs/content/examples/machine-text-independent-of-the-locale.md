```pseudo title="Avoid"
let amount = formatNumber(total)
let sku = upperCase(code)
# in the process's locale:
# "1,5" or "1.5", "İ" or "I"
```

```pseudo title="Prefer"
let amount = formatNumber(total,
  invariantLocale)
let sku = upperCase(code,
  invariantLocale)
```
