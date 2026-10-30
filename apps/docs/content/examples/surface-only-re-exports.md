```pseudo title="Avoid"
# features/orders/index
export * from "./application/use-cases"
export * from "./domain/entities"

function totalOf(order)
  return sum(order.lines)
```

```pseudo title="Prefer"
# features/orders/index
export { placeOrder }
  from "./application/use-cases"
export { Order }
  from "./domain/entities"
```
