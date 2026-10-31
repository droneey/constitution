```text title="Avoid"
src/
├── features/invoices/application/
│   └── use-cases/issue-invoice/
└── kernel/value-objects/
    └── invoice-number.value-object.ts
```

```text title="Prefer"
src/features/invoices/
├── application/use-cases/issue-invoice/
└── domain/invoice/value-objects/
    └── invoice-number.value-object.ts
```
