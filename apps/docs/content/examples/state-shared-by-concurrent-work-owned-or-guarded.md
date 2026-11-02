```pseudo title="Avoid"
function reserve(reserved, sku, quantity)
  let current = reserved.get(sku)

  reserved.set(sku, current + quantity)

# root/stock: one map, handed to every request handler
let reserved = new Map()
```

```pseudo title="Prefer"
function reserve(reserved, sku, quantity)
  reserved.add(sku, quantity)

# root/stock: one set of counters, handed to every request handler
let reserved = new AtomicCounters()
```
