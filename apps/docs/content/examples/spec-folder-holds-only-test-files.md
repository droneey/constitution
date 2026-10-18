```text title="Avoid"
orders/__tests__/
├── cancel-order.use-case.test.ts
├── helpers.ts
├── setup-db.ts
├── data.json
└── cancel-order.test.ts.bak
```

```text title="Prefer"
orders/__tests__/
├── cancel-order.use-case.test.ts
├── order.repository.fake.ts
├── order.repository.suite.ts
├── orders.fixtures.ts
└── invoice.golden.xml
```
