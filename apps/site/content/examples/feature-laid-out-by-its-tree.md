```text title="Avoid"
features/orders/
├── domain/
│   └── order.entity.ts
├── adapters/postgres/
│   ├── order.repository.ts
│   └── index.ts
├── order.model.ts
└── index.ts
```

```text title="Prefer"
features/orders/
├── domain/
│   └── entities/
│       ├── order.entity.ts
│       └── index.ts
├── adapters/postgres/
│   ├── models/order.model.ts
│   ├── order.repository.ts
│   └── index.ts
└── index.ts
```
