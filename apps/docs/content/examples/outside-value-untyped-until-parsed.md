```pseudo title="Avoid"
let body = await response.json()
let order = body as Order
call shipOrder(order)
```

```pseudo title="Prefer"
# body is Unknown until it is parsed
let body = await response.json()
let order = orderSchema.parse(body)
call shipOrder(order)
```
