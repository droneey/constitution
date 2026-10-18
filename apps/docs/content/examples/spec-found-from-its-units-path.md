```text title="Avoid"
src/
├── features/orders/…/pay-order/
│   └── pay-order.use-case.ts
└── specs/
    └── unit/
        └── payments.test.ts
```

```text title="Prefer"
src/
└── features/orders/…/pay-order/
    ├── pay-order.use-case.ts
    └── __tests__/
        └── pay-order.use-case.test.ts
```
