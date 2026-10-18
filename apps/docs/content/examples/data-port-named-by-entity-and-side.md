```pseudo title="Avoid"
type OrderReader = {
  find(id: OrderId): Order
}

type OrderStore = {
  save(order: Order): nothing
}
```

```pseudo title="Prefer"
type OrderQueryRepository = {
  find(id: OrderId): Order
}

type OrderCommandRepository = {
  save(order: Order): nothing
}
```
