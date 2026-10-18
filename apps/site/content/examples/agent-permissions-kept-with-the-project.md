```text
repository/
├── .claude/
│   ├── settings.json         the project's permissions, deny rules too:
│   │                         committed, the same for every person
│   └── settings.local.json   one person's overrides, on their machine
└── .gitignore                lists .claude/settings.local.json
```
