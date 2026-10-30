```text title="Avoid"
src/
├── feature/
│   └── orders/
│       ├── domain/
│       │   ├── models/
│       │   └── exceptions/
│       └── app/
│           └── ports/
└── common/
```

```text title="Prefer"
src/
├── features/
│   └── orders/
│       ├── domain/
│       │   ├── entities/
│       │   └── errors/
│       └── application/
│           └── contracts/
└── shared/
```
