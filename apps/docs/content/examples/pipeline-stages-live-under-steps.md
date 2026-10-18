```text
features/invoices/domain/use-cases/commands/import-invoices/
├── import-invoices.use-case.ts   calls the steps below, in this order
├── steps/
│   ├── parse-rows.ts             first
│   ├── validate-rows.ts          second
│   ├── save-invoices.ts          third
│   └── index.ts
└── index.ts
```
