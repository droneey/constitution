```text title="Avoid"
orders/infrastructure/
├── find-order-postgres/
├── list-orders-postgres/
├── save-order-postgres/
└── charge-stripe/
```

```text title="Prefer"
orders/infrastructure/
├── postgres/  OrderQueryRepository,
│              OrderCommandRepository
└── stripe/    PaymentPort
```
