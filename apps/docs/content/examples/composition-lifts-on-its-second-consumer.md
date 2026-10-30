```text title="Avoid"
composition/checkout/
├── presentation/
│   └── check-out.ts
├── application/use-cases/
│   └── price-cart/   only check-out
└── index.ts
```

```text title="Prefer"
composition/checkout/
├── presentation/
│   └── check-out.ts  prices the cart
└── index.ts
```
