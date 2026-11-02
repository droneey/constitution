```pseudo title="Avoid"
function isOrder(value: Unknown): value is Order
  return "id" in value

if isOrder(body) then shipOrder(body)
```

```pseudo title="Prefer"
function isOrder(value: Unknown): value is Order
  return orderSchema.check(value)

if isOrder(body) then shipOrder(body)
```
