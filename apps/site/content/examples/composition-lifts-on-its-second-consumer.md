```text title="Avoid"
composition/checkout/
├── app/
│   └── check-out.ts
├── domain/use-cases/
│   └── price-cart/   only check-out
└── index.ts
```

```text title="Prefer"
composition/checkout/
├── app/
│   └── check-out.ts  prices the cart
└── index.ts
```
