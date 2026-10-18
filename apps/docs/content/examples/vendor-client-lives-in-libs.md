```text
src/
├── libs/
│   └── stripe/                 the client: knows nothing of the shop
├── adapters/
│   └── stripe/                 thin: the kernel's ports over it
└── features/payments/adapters/
    └── stripe/                 thin: the feature's ports over it
```
