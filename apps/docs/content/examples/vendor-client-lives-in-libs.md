```text
src/
├── libs/
│   └── stripe/                 the client: knows nothing of the shop
├── infrastructure/
│   └── stripe/                 thin: the kernel's ports over it
└── features/payments/infrastructure/
    └── stripe/                 thin: the feature's ports over it
```
