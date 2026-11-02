```text title="Avoid"
orders/application/use-cases/commands/
└── place-order.use-case     812 lines
```

```text title="Prefer"
orders/application/use-cases/commands/
└── place-order/
    ├── place-order.use-case  96 lines
    └── steps/
        ├── price-lines      140 lines
        ├── apply-discounts  210 lines
        └── reserve-stock    170 lines
```
