```text title="Avoid"
packages/orders/
├── src/
│   ├── features/
│   ├── bundle-size-report
│   └── index
└── package.json
```

```text title="Prefer"
packages/orders/
├── scripts/
│   └── bundle-size-report
├── src/
│   ├── features/
│   └── index
└── package.json
```
