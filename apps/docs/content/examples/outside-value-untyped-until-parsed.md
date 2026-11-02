```pseudo title="Avoid"
let body = await response.json()
let input = body as ShipOrderInput

call shipOrder(input, context)
```

```pseudo title="Prefer"
# body is Unknown until it is parsed
let body = await response.json()
let input = parseShipOrderInput(body)

call shipOrder(input, context)
```
