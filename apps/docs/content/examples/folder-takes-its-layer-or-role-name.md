```text title="Avoid"
src/
├── feature/
│   └── orders/
│       └── domain/
│           ├── models/
│           ├── ports/
│           └── exceptions/
└── common/
```

```text title="Prefer"
src/
├── features/
│   └── orders/
│       └── domain/
│           ├── entities/
│           ├── contracts/
│           └── errors/
└── shared/
```
