# Workspace

> Governs the coverage gate of each package of a workspace.

## General

### coverage-gate-on-the-unit-alone → package-checks-reach-only-its-own-files · MUST

In a workspace, every package's coverage gate counts only its own files. Its `bunfig.integration.toml` adds `"../**"` to `coveragePathIgnorePatterns`, so the gate never counts the files of a package it imports.

#### Why

Bun counts every file a spec loads, an imported package's source included, so a package whose specs use one function of another fails on the other's functions it never calls; the other package's own specs hold its files.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/bunfig.json
# packages/invoices/bunfig.integration.toml
[test]
randomize = true
coverage = true
coverageThreshold = { lines = 1, functions = 1 }
coveragePathIgnorePatterns = ["**/__tests__/**"]
```

```toml title="Prefer"
#:schema https://json.schemastore.org/bunfig.json
# packages/invoices/bunfig.integration.toml
[test]
randomize = true
coverage = true
coverageThreshold = { lines = 1, functions = 1 }
coveragePathIgnorePatterns = ["**/__tests__/**", "../**"]
```
