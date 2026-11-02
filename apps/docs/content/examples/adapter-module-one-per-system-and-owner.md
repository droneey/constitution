```text title="Avoid"
orders/infrastructure/
├── find-order-postgres/
├── list-orders-postgres/
├── save-order-postgres/
└── charge-stripe/
```

```text title="Prefer"
orders/infrastructure/
├── postgres/
│   ├── models/
│   ├── order-queries.adapter
│   ├── order-repository.adapter
│   └── index
└── stripe/
    ├── models/
    ├── payment.adapter
    └── index
```
