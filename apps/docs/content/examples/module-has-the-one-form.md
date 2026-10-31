```text
src/
├── features/orders/              a feature
│   ├── domain/order/
│   │   └── entities/             a role folder: the same form
│   │       ├── order.aggregate.ts
│   │       ├── order-line.entity.ts
│   │       └── index.ts
│   ├── presentation/
│   └── index.ts                  its surface
└── libs/retries/                 a lib: the same form
    ├── retry.utils.ts
    └── index.ts
```
