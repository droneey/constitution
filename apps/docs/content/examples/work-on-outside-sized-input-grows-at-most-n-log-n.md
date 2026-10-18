```pseudo title="Avoid"
# n² over a list the client sends
for each line in cart.lines
  for each other in cart.lines
    if line.sku is other.sku
      throw DuplicateLineError
```

```pseudo title="Prefer"
let seen = new Set()
for each line in cart.lines
  if seen.has(line.sku)
    throw DuplicateLineError
  seen.add(line.sku)
```
