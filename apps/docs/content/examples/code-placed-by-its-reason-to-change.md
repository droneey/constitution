```text title="Avoid"
src/
├── features/invoices/domain/
│   └── use-cases/issue-invoice/
└── kernel/value-objects/
    └── invoice-number.value-object.ts
```

```text title="Prefer"
src/features/invoices/domain/
├── use-cases/issue-invoice/
└── value-objects/
    └── invoice-number.value-object.ts
```
