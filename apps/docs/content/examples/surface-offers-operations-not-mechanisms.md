```pseudo title="Avoid"
# features/orders/index
export { placeOrder }
  from "./application/use-cases"
export { cancel }
  from "./domain/order/transitions"
export { OrderRowModel }
  from "./infrastructure/postgres"
```

```pseudo title="Prefer"
# features/orders/index
export { placeOrder, getOrder }
  from "./application/use-cases"
export { Order }
  from "./domain/order/entities"
export { OrderStatus }
  from "./domain/order/value-objects"
export { OrderNotFoundError }
  from "./domain/order/errors"
```
