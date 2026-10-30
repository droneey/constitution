```text
src/
├── features/orders/              a feature
│   ├── domain/
│   │   └── entities/             a role folder: the same form
│   │       ├── order/            an entity's folder: the same form
│   │       │   ├── order.entity.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── presentation/
│   └── index.ts                  its surface
└── libs/retries/                 a lib: the same form
    ├── retry.utils.ts
    └── index.ts
```
