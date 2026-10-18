```pseudo title="Avoid"
# features/orders/index
export { placeOrder }
  from "./domain/use-cases"
export { OrderRowModel }
  from "./adapters/postgres"
```

```pseudo title="Prefer"
# features/orders/index
export { placeOrder }
  from "./domain/use-cases"
export { Order }
  from "./domain/entities"
```
