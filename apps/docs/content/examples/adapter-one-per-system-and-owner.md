```text title="Avoid"
orders/adapters/
├── find-order-postgres/
├── list-orders-postgres/
├── save-order-postgres/
└── charge-stripe/
```

```text title="Prefer"
orders/adapters/
├── postgres/  OrderQueryRepository,
│              OrderCommandRepository
└── stripe/    PaymentPort
```
