```pseudo title="Avoid"
# features/orders/index
export { placeOrder }
  from "./application/use-cases"
export { OrderRowModel }
  from "./infrastructure/postgres"
```

```pseudo title="Prefer"
# features/orders/index
export { placeOrder }
  from "./application/use-cases"
export { Order }
  from "./domain/entities"
```
