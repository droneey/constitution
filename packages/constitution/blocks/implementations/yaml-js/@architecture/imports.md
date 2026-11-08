# Imports

> Governs where the `yaml` package is imported.

## General

### yaml-package-home-is-where-yaml-is-read-or-written → layer-imports-dependencies-by-its-role · MUST

The `yaml` package is imported only where YAML is read or written. Its homes are the adapters that read or write YAML and the generic library that wraps the package; no other folder imports it.

| Why |
|---|
| a parser in the domain ties the business rules to a file format, and its untyped result travels inward unchecked — the dependency rule. |
