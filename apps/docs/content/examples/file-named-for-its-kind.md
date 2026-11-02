```text
features/invoices/
├── README.md                           the module's readme
├── application/contracts/
│   ├── payment.port.ts
│   └── __tests__/
│       ├── payment.fake.ts     a fake of the contract
│       └── payment.suite.ts    its contract suite
├── application/use-cases/commands/
│   ├── issue-invoice.use-case.ts
│   └── __tests__/
│       ├── issue-invoice.use-case.test.ts  a spec
│       └── issue-invoice.fixtures.ts       its fixtures
└── infrastructure/pdf/
    ├── invoice-pdf.adapter.ts
    ├── pdf-api.gen.ts                  generated from a schema
    └── __tests__/
        ├── invoice-pdf.adapter.integration.test.ts
        └── invoice.golden.pdf          a golden file
```
