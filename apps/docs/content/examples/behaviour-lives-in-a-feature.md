```text title="Avoid"
src/
├── features/orders/
└── shared/utils/
    └── refund-order.utils.ts
```

```text title="Prefer"
src/
└── features/orders/
    └── application/use-cases/commands/
        └── refund-order/
            └── refund-order.use-case.ts
```
