```text
lint/
├── rules/                  members only, one file per rule
│   ├── no-empty-folder.ts
│   ├── readme-present.ts
│   └── single-extension.ts
├── rule.types.ts           the contract every rule meets
├── rule-registry.ts        lists the members
├── run-rules.ts            the runner
└── index.ts
```
