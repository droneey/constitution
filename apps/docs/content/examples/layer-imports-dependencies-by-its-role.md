```text
src/
├── main.ts                 any dependency: the edge
├── root/                   any dependency: the edge
├── composition/            only one whose block gives it a home here
├── features/orders/
│   ├── presentation/       only one whose block gives it a home here
│   ├── application/        none
│   ├── domain/             none
│   └── infrastructure/stripe/  any dependency: the edge
├── kernel/                 none
├── shared/                 only one whose block gives it a home here
├── infrastructure/         any dependency: the edge
└── libs/                   any dependency: the edge
```
