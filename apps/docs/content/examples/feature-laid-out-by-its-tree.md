```text title="Avoid"
features/orders/
├── domain/
│   └── order.entity.ts
├── infrastructure/postgres/
│   ├── order.repository.ts
│   └── index.ts
├── order.model.ts
└── index.ts
```

```text title="Prefer"
features/orders/
├── domain/
│   └── order/
│       ├── entities/
│       │   ├── order.aggregate.ts
│       │   └── index.ts
│       └── transitions/
│           ├── order.transitions.ts
│           └── index.ts
├── infrastructure/postgres/
│   ├── models/order.model.ts
│   ├── order.repository.ts
│   └── index.ts
└── index.ts
```
