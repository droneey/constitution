# Contracts

> Governs a contract of import-linter.

## General

### contract-named-after-its-rule · SHOULD

Every contract's `name` is the slug of the rule it holds.

#### Why

A contract named otherwise breaks with a name that says nothing of why the import is refused, and its reader must find the rule it holds.

#### Examples

```toml title="Avoid"
[[tool.importlinter.contracts]]
name = "Domain must not import infrastructure"
type = "forbidden"
source_modules = ["*.features.*.domain"]
forbidden_modules = ["*.features.*.infrastructure"]
```

```toml title="Prefer"
[[tool.importlinter.contracts]]
name = "domain-imports-only-itself-and-the-kernel"
type = "forbidden"
source_modules = ["*.features.*.domain"]
forbidden_modules = ["*.features.*.infrastructure"]
```
