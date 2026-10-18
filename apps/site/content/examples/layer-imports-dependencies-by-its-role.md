```text
src/
├── main.ts                 any dependency: the edge
├── root/                   any dependency: the edge
├── composition/            only one whose block gives it a home here
├── features/orders/
│   ├── app/                only one whose block gives it a home here
│   ├── domain/             none
│   └── adapters/stripe/    any dependency: the edge
├── kernel/                 none
├── shared/                 only one whose block gives it a home here
├── adapters/               any dependency: the edge
└── libs/                   any dependency: the edge
```
