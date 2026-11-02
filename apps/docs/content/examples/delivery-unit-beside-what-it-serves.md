```text
src/
├── features/orders/presentation/
│   └── bindings/commands/cancel-order.ts   serves one feature
├── composition/checkout/presentation/
│   └── bindings/commands/check-out.ts      composes orders and payments
└── root/                                   registers both
```
