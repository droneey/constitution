```text title="Avoid"
orders/domain/
├── entities/
│   └── order.ts
├── errors/
│   └── order-already-paid.ts
└── contracts/
    └── payment-gateway.ts
```

```text title="Prefer"
orders/domain/
├── entities/
│   └── order.entity.ts
├── errors/
│   └── order-already-paid.error.ts
└── contracts/
    └── payment-gateway.port.ts
```
