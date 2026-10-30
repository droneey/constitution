```text title="Avoid"
orders/
├── domain/entities/
│   └── order.ts
├── domain/errors/
│   └── order-already-paid.ts
└── application/contracts/
    └── payment-gateway.ts
```

```text title="Prefer"
orders/
├── domain/entities/
│   └── order.entity.ts
├── domain/errors/
│   └── order-already-paid.error.ts
└── application/contracts/
    └── payment-gateway.port.ts
```
