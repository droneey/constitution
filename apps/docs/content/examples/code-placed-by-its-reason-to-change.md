```text title="Avoid"
src/
├── features/invoices/application/
│   └── use-cases/commands/issue-invoice.use-case.ts
└── kernel/value-objects/
    └── invoice-number.value-object.ts
```

```text title="Prefer"
src/features/invoices/
├── application/use-cases/commands/issue-invoice.use-case.ts
└── domain/invoice/value-objects/
    └── invoice-number.value-object.ts
```
