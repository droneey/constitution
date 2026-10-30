```text
src/
├── kernel/errors/
│   ├── app.error.ts                   the base every error extends
│   ├── not-found.error.ts             a failure every feature shares
│   └── index.ts
└── features/orders/domain/order/errors/
    ├── order-already-paid.error.ts    the feature's own, of its concept
    └── index.ts
```
