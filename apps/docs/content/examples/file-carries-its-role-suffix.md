```text title="Avoid"
orders/
├── domain/order/entities/
│   └── order.ts
├── domain/order/errors/
│   └── order-already-paid.ts
└── application/contracts/
    └── payment-gateway.ts
```

```text title="Prefer"
orders/
├── domain/order/entities/
│   └── order.aggregate.ts
├── domain/order/errors/
│   └── order-already-paid.error.ts
└── application/contracts/
    └── payment-gateway.port.ts
```
