```pseudo title="Avoid"
# shared by every request handler
let reserved = new Map()

function reserve(sku, quantity)
  let current = reserved.get(sku)
  reserved.set(sku, current + quantity)
```

```pseudo title="Prefer"
# shared by every request handler
let reserved = new AtomicCounters()

function reserve(sku, quantity)
  reserved.add(sku, quantity)
```
