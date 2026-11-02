```text title="Avoid"
src/
├── features/
│   ├── billing/   imports orders' port
│   └── orders/
│       └── application/contracts/
│           └── clock.port.ts
└── kernel/
```

```text title="Prefer"
src/
├── features/
│   ├── billing/   imports the kernel's
│   └── orders/    imports the kernel's
└── kernel/
    └── contracts/
        └── clock.port.ts
```
