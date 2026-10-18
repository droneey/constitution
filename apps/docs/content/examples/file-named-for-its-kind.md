```text
features/invoices/
├── README.md                           the module's readme
├── domain/contracts/
│   ├── payment-gateway.port.ts
│   ├── payment-gateway.fake.ts         a fake of the contract
│   └── payment-gateway.suite.ts        its contract suite
├── domain/use-cases/commands/issue-invoice/
│   ├── issue-invoice.use-case.ts
│   ├── issue-invoice.use-case.test.ts  a spec
│   └── issue-invoice.fixtures.ts       its fixtures
└── adapters/pdf/
    ├── invoice-pdf.adapter.ts
    ├── invoice-pdf.adapter.integration.test.ts
    ├── invoice.golden.pdf              a golden file
    └── pdf-api.gen.ts                  generated from a schema
```
