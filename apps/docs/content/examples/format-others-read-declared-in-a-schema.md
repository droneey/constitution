```text title="Avoid"
invoices/infrastructure/files/
├── invoice-export.adapter
│     writes the invoice whole
└── README.md
      the file's format, in prose
```

```text title="Prefer"
invoices/infrastructure/files/
├── models/
│   ├── invoice-file.model
│   │     maps only the fields the
│   │     schema declares
│   └── invoice-file.schema.json
├── invoice-export.adapter
└── __tests__/
    └── invoice-export.adapter.test
          checks what it writes
          against the schema
```
