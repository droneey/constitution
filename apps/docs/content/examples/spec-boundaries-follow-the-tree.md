```text
src/
├── root/
│   ├── wiring.ts                       no spec: the wiring
│   └── app.config.ts                   spec: a unit of the root
├── features/orders/
│   ├── domain/
│   │   ├── value-objects/money/        spec: pure rules
│   │   ├── errors/                     no spec: proven through callers
│   │   └── use-cases/…/pay-order/      spec: a use case
│   ├── adapters/postgres/              spec: an adapter
│   └── index.ts                        the surface
├── composition/checkout/               spec where it derives a fact
└── libs/retry/                         spec: a lib
```
