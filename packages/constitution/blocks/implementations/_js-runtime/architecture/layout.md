# Layout

> Governs the specifier an import that crosses a module's border is written with.

## Imports

### hash-imports-leave-the-module → module-files-import-each-other-directly · MUST

An import that leaves its module is written from `#/`, and an import inside its module by a relative path.

| Why |
|---|
| the specifier then shows at a glance whether an import crosses a module's border. |
