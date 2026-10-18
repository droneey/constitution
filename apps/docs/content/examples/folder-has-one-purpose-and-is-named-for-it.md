```text title="Avoid"
libs/
└── helpers/
    ├── index.ts
    ├── parse-csv.utils.ts
    ├── retry.utils.ts
    └── slugify.utils.ts
```

```text title="Prefer"
libs/
├── csv/
│   ├── index.ts
│   └── parse-csv.utils.ts
├── retries/
│   ├── index.ts
│   └── retry.utils.ts
└── slugs/
    ├── index.ts
    └── slugify.utils.ts
```
