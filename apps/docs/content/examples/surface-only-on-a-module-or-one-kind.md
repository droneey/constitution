```text
src/                            an application's source: no surface
├── main.ts
├── root/
│   └── index.ts                the one layer with a surface
└── features/                   a layer: no surface
    └── orders/
        ├── index.ts            a module: its door
        └── domain/             a layer: no surface
            └── order/          a concept folder: no surface
                └── entities/
                    └── index.ts    a role folder of one kind: a surface
```
