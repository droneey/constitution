# Layout

> Governs the specifier an import that crosses a module's border is written with.

## Imports

### hash-imports-leave-the-module → file-never-imports-its-own-modules-surface · MUST

An import that leaves its module is written from `#/`, and an import inside its module by a relative path.

| Why |
|---|
| with one form for both, an import that crosses a module's border reads like one inside it, so neither a reviewer nor the tool that holds the surfaces can tell which imports must go through a surface. |
