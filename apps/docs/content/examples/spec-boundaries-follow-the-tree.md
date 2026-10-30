```text
src/
├── root/
│   ├── wiring.ts                       no spec: the wiring
│   └── app.config.ts                   spec: a unit of the root
├── features/orders/
│   ├── domain/
│   │   ├── order/transitions/          spec: pure rules
│   │   └── order/errors/               no spec: proven through callers
│   ├── application/
│   │   └── use-cases/…/pay-order/      spec: a use case
│   ├── infrastructure/postgres/        spec: an adapter
│   └── index.ts                        the surface
├── composition/checkout/               spec where it derives a fact
└── libs/retry/                         spec: a lib
```
