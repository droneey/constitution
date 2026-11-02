```text title="Avoid"
features/catalog/application/use-cases/commands/
├── import-catalog.use-case.ts
├── read-rows.ts
├── match-products.ts
└── save-prices.ts
```

```text title="Prefer"
features/catalog/application/use-cases/commands/
└── import-catalog/
    ├── steps/
    │   ├── read-rows.ts
    │   ├── match-products.ts
    │   ├── save-prices.ts
    │   └── index.ts
    ├── import-catalog.use-case.ts
    └── index.ts
```
