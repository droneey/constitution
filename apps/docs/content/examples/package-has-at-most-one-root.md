```text
packages/
├── shop-api/              a program on the HTTP framework: one root
│   └── src/
│       ├── main.*         starts the root
│       ├── entrypoints/
│       │   └── cli/       starts the same root another way
│       └── root/
├── shop-worker/           wired apart, on a queue runtime: its own root
│   └── src/root/
└── shop-core/             what both run, a library: no root
    └── src/features/
```
