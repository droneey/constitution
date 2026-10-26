```text
money/                          a group folder, no package of its own
├── python/                     droneey-money-python: its manifest, src/
├── typescript/                 @droneey/money-typescript: its manifest, src/
└── shared/                     droneey-money-shared and @droneey/money-shared: a manifest for each language
    └── droneey_money_shared/   the one folder Python's packaging asks for
        ├── schema/             money.schema.json, which each language takes by the package's name
        └── conformance/        the cases both packages must pass
```
