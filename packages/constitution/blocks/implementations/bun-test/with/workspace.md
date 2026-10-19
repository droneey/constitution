# Workspace

> The coverage gate of each package of a workspace.

### coverage-gate-on-the-unit-alone → unit-checked-by-its-own-tools · MUST

In a workspace, each package's `bunfig.integration.toml` adds `"../**"` to `coveragePathIgnorePatterns`, so its gate counts only the package's own files, never those of a package it imports.

| Why | Tags |
|---|---|
| Bun counts every file a spec loads, an imported package's source included, so a package whose specs use one function of another fails on the other's functions it never calls; the other package's own specs hold its files. | [testing] |
