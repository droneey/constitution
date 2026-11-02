```text
src/
├── main.ts                             no spec: proven by the boot spec
├── root/                               no spec: proven by the boot spec
├── features/orders/
│   ├── domain/
│   │   ├── order/transitions/          spec: the aggregate, through its transitions
│   │   ├── order/value-objects/        spec: a value object with an invariant
│   │   └── order/errors/               no spec: proven through callers
│   ├── application/
│   │   └── use-cases/                  spec: each use case, with its parse
│   ├── infrastructure/postgres/        spec: an adapter
│   ├── presentation/                   spec: a delivery unit, a binding unit that decides
│   └── index.ts                        the surface
├── composition/checkout/               spec where it derives a fact
└── libs/retry/                         spec: a lib
```
