# Imports

> Governs where the `yaml` package is imported.

## General

### yaml-home-is-the-parsing-adapter-and-lib → layer-imports-dependencies-by-its-role · MUST

The `yaml` package is imported only where YAML is parsed. Its home is the adapters of the infrastructure that parse YAML and the lib under `libs/` that wraps it; no other folder imports it.

| Why |
|---|
| a parser in the domain ties the business rules to a file format, and its untyped result travels inward unchecked — the dependency rule. |
